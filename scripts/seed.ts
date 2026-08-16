import postgres from 'postgres';

/**
 * Seed script — inserts a few placeholder topics and disabled example sources.
 * RSS URLs are intentionally left as placeholders you should verify before enabling.
 */
async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required');
  const sql = postgres(url, { prepare: false, max: 1 });

  const topics = [
    ['Artificial Intelligence', 'AI, LLMs, machine learning, AI agents, neural networks'],
    ['Software Development', 'programming, developer tools, frameworks, software engineering'],
    ['Cybersecurity', 'security vulnerabilities, cyber attacks, breaches, security research'],
    ['Israel', 'Israeli politics, security, major national events, Middle East'],
    ['World News', 'international news, world affairs, geopolitics'],
    ['Economy', 'economy, markets, finance, trade, inflation'],
  ] as const;

  for (const [name, description] of topics) {
    await sql`INSERT INTO topics (name, description) VALUES (${name}, ${description})
              ON CONFLICT (name) DO NOTHING`;
  }

  // Placeholder sources — disabled by default. Verify their RSS URLs in Settings.
  const sources = [
    ['Reuters World', 'https://www.reuters.com', 'https://www.reuters.com/rssFeed/worldNews'],
    ['BBC World', 'https://www.bbc.com/news/world', 'https://feeds.bbci.co.uk/news/world/rss.xml'],
    ['The Verge', 'https://www.theverge.com', 'https://www.theverge.com/rss/index.xml'],
    ['Hacker News', 'https://news.ycombinator.com', 'https://hnrss.org/frontpage'],
  ] as const;

  for (const [name, website, rss] of sources) {
    await sql`INSERT INTO sources (name, website_url, rss_url, enabled)
              VALUES (${name}, ${website}, ${rss}, FALSE)
              ON CONFLICT (rss_url) DO NOTHING`;
  }

  console.log('Seed complete.');
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
