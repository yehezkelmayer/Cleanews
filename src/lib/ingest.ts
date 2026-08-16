import { repo } from './repo';
import { fetchFeed } from './rss';
import { extractArticle } from './extract';
import { defaultMatcher, DEFAULT_MATCH_THRESHOLD } from './matcher';
import { contentHash } from './hash';
import { parseTelegramHandle, fetchTelegramChannel } from './telegram';

export type IngestSummary = {
  sourcesChecked: number;
  articlesFound: number;
  newArticles: number;
  errors: number;
  errorDetails: { source: string; message: string }[];
};

export async function runIngestion(): Promise<IngestSummary> {
  const sources = await repo.enabledSources();
  const allTopics = await repo.enabledTopics();

  const summary: IngestSummary = {
    sourcesChecked: sources.length,
    articlesFound: 0,
    newArticles: 0,
    errors: 0,
    errorDetails: [],
  };

  for (const source of sources) {
    try {
      // Determine which topics apply for this source.
      const explicitTopicIds = await repo.getSourceTopicIds(source.id);
      const sourceTopics =
        explicitTopicIds.length > 0
          ? allTopics.filter((t) => explicitTopicIds.includes(t.id))
          : allTopics;

      // Telegram sources: scrape t.me/s/<handle> instead of parsing RSS.
      const tgHandle = parseTelegramHandle(source.rss_url);
      if (tgHandle) {
        const messages = await fetchTelegramChannel(tgHandle);
        summary.articlesFound += messages.length;

        for (const msg of messages) {
          try {
            const existing = await repo.findArticleByAny(msg.link, null, null);
            if (existing) continue;

            const hash = contentHash(msg.description);
            if (hash) {
              const dup = await repo.findArticleByAny(msg.link, null, hash);
              if (dup) continue;
            }

            const inserted = await repo.insertArticle({
              source_id: source.id,
              title: msg.title,
              url: msg.link,
              canonical_url: null,
              published_at: msg.publishedAt,
              description: msg.description,
              clean_text: msg.description,
              clean_html: msg.cleanHtml,
              content_hash: hash,
            });
            if (!inserted) continue;
            summary.newArticles += 1;

            const matches = await defaultMatcher.match(
              { title: inserted.title, description: inserted.description ?? '', text: inserted.clean_text ?? '' },
              sourceTopics,
            );
            const kept = matches.filter((m) => m.score >= DEFAULT_MATCH_THRESHOLD);
            if (kept.length > 0) await repo.setArticleTopics(inserted.id, kept);
          } catch (err) {
            summary.errors += 1;
            summary.errorDetails.push({
              source: source.name,
              message: `message ${msg.link}: ${(err as Error).message}`,
            });
          }
        }
        continue;
      }

      const entries = await fetchFeed(source.rss_url);
      summary.articlesFound += entries.length;

      for (const entry of entries) {
        try {
          const existing = await repo.findArticleByAny(entry.link, null, null);
          if (existing) continue;

          const extracted = await extractArticle(entry.link).catch(() => null);
          const cleanHtml = extracted?.cleanHtml ?? '';
          const cleanText = extracted?.cleanText ?? entry.description ?? '';
          const canonical = extracted?.canonicalUrl ?? null;
          const hash = contentHash(cleanText);

          if (canonical || hash) {
            const dup = await repo.findArticleByAny(entry.link, canonical, hash);
            if (dup) continue;
          }

          const inserted = await repo.insertArticle({
            source_id: source.id,
            title: extracted?.title || entry.title,
            url: entry.link,
            canonical_url: canonical,
            published_at: entry.publishedAt,
            description: entry.description,
            clean_text: cleanText || null,
            clean_html: cleanHtml || null,
            content_hash: hash,
          });

          if (!inserted) continue;
          summary.newArticles += 1;

          const matches = await defaultMatcher.match(
            {
              title: inserted.title,
              description: inserted.description ?? '',
              text: inserted.clean_text ?? '',
            },
            sourceTopics,
          );
          const kept = matches.filter((m) => m.score >= DEFAULT_MATCH_THRESHOLD);
          if (kept.length > 0) await repo.setArticleTopics(inserted.id, kept);
        } catch (err) {
          summary.errors += 1;
          summary.errorDetails.push({
            source: source.name,
            message: `article ${entry.link}: ${(err as Error).message}`,
          });
        }
      }
    } catch (err) {
      summary.errors += 1;
      summary.errorDetails.push({
        source: source.name,
        message: (err as Error).message,
      });
    }
  }

  return summary;
}
