import Parser from 'rss-parser';

export type FeedEntry = {
  title: string;
  link: string;
  publishedAt: string | null;
  description: string | null;
};

const parser = new Parser({
  timeout: 15_000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; CleanewsBot/1.0; +text-only reader)',
  },
});

export async function fetchFeed(rssUrl: string): Promise<FeedEntry[]> {
  const feed = await parser.parseURL(rssUrl);
  const items = feed.items ?? [];
  return items
    .map((item) => {
      const link = (item.link || (item as { guid?: string }).guid || '').trim();
      if (!link || !item.title) return null;
      const publishedAt =
        item.isoDate ??
        (item.pubDate ? new Date(item.pubDate).toISOString() : null);
      const description =
        (item.contentSnippet as string | undefined) ??
        (item.summary as string | undefined) ??
        null;
      return {
        title: item.title.trim(),
        link,
        publishedAt,
        description: description ? description.trim().slice(0, 600) : null,
      } satisfies FeedEntry;
    })
    .filter((v): v is FeedEntry => v !== null);
}
