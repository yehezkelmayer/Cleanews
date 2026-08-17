import { repo } from './repo';
import { fetchFeed } from './rss';
import { extractArticle } from './extract';
import { contentHash } from './hash';
import { parseTelegramHandle, fetchTelegramChannel } from './telegram';

export type IngestSummary = {
  sourcesChecked: number;
  articlesFound: number;
  newArticles: number;
  errors: number;
  errorDetails: { source: string; message: string }[];
};

/**
 * Phase 1 ingestion: iterate the GLOBAL feed_sources table, oldest-fetched
 * first, and store new articles once. No per-user topic matching happens
 * here — matching is computed at query time per user, from user_topics.
 *
 * A single source failing is recorded on the source row (last_error,
 * fetch_failure_count) and doesn't stop the rest of the batch.
 */
export async function runIngestion(opts?: { limit?: number }): Promise<IngestSummary> {
  const sources = await repo.feedSourcesDueForFetch(opts?.limit ?? 100);

  const summary: IngestSummary = {
    sourcesChecked: sources.length,
    articlesFound: 0,
    newArticles: 0,
    errors: 0,
    errorDetails: [],
  };

  for (const source of sources) {
    try {
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
              feed_source_id: source.id,
              title: msg.title,
              url: msg.link,
              canonical_url: null,
              published_at: msg.publishedAt,
              description: msg.description,
              clean_text: msg.description,
              clean_html: msg.cleanHtml,
              content_hash: hash,
            });
            if (inserted) summary.newArticles += 1;
          } catch (err) {
            summary.errors += 1;
            summary.errorDetails.push({
              source: source.canonical_name,
              message: `message ${msg.link}: ${(err as Error).message}`,
            });
          }
        }
        await repo.feedSourceMarkFetched(source.id, true);
        continue;
      }

      // Classic RSS
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
            feed_source_id: source.id,
            title: extracted?.title || entry.title,
            url: entry.link,
            canonical_url: canonical,
            published_at: entry.publishedAt,
            description: entry.description,
            clean_text: cleanText || null,
            clean_html: cleanHtml || null,
            content_hash: hash,
          });
          if (inserted) summary.newArticles += 1;
        } catch (err) {
          summary.errors += 1;
          summary.errorDetails.push({
            source: source.canonical_name,
            message: `article ${entry.link}: ${(err as Error).message}`,
          });
        }
      }
      await repo.feedSourceMarkFetched(source.id, true);
    } catch (err) {
      summary.errors += 1;
      const message = (err as Error).message;
      summary.errorDetails.push({ source: source.canonical_name, message });
      await repo.feedSourceMarkFetched(source.id, false, message).catch(() => {});
    }
  }

  return summary;
}
