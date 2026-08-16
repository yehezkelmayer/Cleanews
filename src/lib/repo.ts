import { sql } from './db';
import type { Article, Settings, Source, Topic, FeedItem } from './types';

export const repo = {
  // sources
  async listSources(): Promise<Source[]> {
    return (await sql<Source[]>`SELECT * FROM sources ORDER BY name ASC`);
  },
  async createSource(input: Omit<Source, 'id' | 'created_at' | 'updated_at'>) {
    const [row] = await sql<Source[]>`
      INSERT INTO sources (name, website_url, rss_url, enabled)
      VALUES (${input.name}, ${input.website_url}, ${input.rss_url}, ${input.enabled})
      RETURNING *`;
    return row;
  },
  async updateSource(id: number, patch: Partial<Omit<Source, 'id'>>) {
    const [row] = await sql<Source[]>`
      UPDATE sources SET
        name        = COALESCE(${patch.name ?? null}, name),
        website_url = COALESCE(${patch.website_url ?? null}, website_url),
        rss_url     = COALESCE(${patch.rss_url ?? null}, rss_url),
        enabled     = COALESCE(${patch.enabled ?? null}, enabled),
        updated_at  = NOW()
      WHERE id = ${id} RETURNING *`;
    return row;
  },
  async deleteSource(id: number) {
    await sql`DELETE FROM sources WHERE id = ${id}`;
  },
  async enabledSources(): Promise<Source[]> {
    return await sql<Source[]>`SELECT * FROM sources WHERE enabled = TRUE ORDER BY name ASC`;
  },

  // topics
  async listTopics(): Promise<Topic[]> {
    return await sql<Topic[]>`SELECT * FROM topics ORDER BY name ASC`;
  },
  async createTopic(input: Omit<Topic, 'id' | 'created_at' | 'updated_at'>) {
    const [row] = await sql<Topic[]>`
      INSERT INTO topics (name, description, enabled)
      VALUES (${input.name}, ${input.description}, ${input.enabled})
      RETURNING *`;
    return row;
  },
  async updateTopic(id: number, patch: Partial<Omit<Topic, 'id'>>) {
    const [row] = await sql<Topic[]>`
      UPDATE topics SET
        name        = COALESCE(${patch.name ?? null}, name),
        description = COALESCE(${patch.description ?? null}, description),
        enabled     = COALESCE(${patch.enabled ?? null}, enabled),
        updated_at  = NOW()
      WHERE id = ${id} RETURNING *`;
    return row;
  },
  async deleteTopic(id: number) {
    await sql`DELETE FROM topics WHERE id = ${id}`;
  },
  async enabledTopics(): Promise<Topic[]> {
    return await sql<Topic[]>`SELECT * FROM topics WHERE enabled = TRUE ORDER BY name ASC`;
  },

  // source_topics
  async getSourceTopicIds(sourceId: number): Promise<number[]> {
    const rows = await sql<{ topic_id: number }[]>`
      SELECT topic_id FROM source_topics WHERE source_id = ${sourceId}`;
    return rows.map((r) => r.topic_id);
  },
  async setSourceTopics(sourceId: number, topicIds: number[]) {
    await sql.begin(async (tx) => {
      await tx`DELETE FROM source_topics WHERE source_id = ${sourceId}`;
      if (topicIds.length > 0) {
        const rows = topicIds.map((t) => ({ source_id: sourceId, topic_id: t }));
        await tx`INSERT INTO source_topics ${tx(rows, 'source_id', 'topic_id')}`;
      }
    });
  },

  // articles
  async findArticleByAny(
    url: string,
    canonical: string | null,
    hash: string | null,
  ): Promise<Article | null> {
    const rows = await sql<Article[]>`
      SELECT * FROM articles
      WHERE url = ${url}
         OR (${canonical}::text IS NOT NULL AND canonical_url = ${canonical})
         OR (${hash}::text IS NOT NULL AND content_hash = ${hash})
      LIMIT 1`;
    return rows[0] ?? null;
  },
  async insertArticle(a: Omit<Article, 'id' | 'created_at'>): Promise<Article> {
    const [row] = await sql<Article[]>`
      INSERT INTO articles (source_id, title, url, canonical_url, published_at,
                            description, clean_text, clean_html, content_hash)
      VALUES (${a.source_id}, ${a.title}, ${a.url}, ${a.canonical_url},
              ${a.published_at}, ${a.description}, ${a.clean_text},
              ${a.clean_html}, ${a.content_hash})
      ON CONFLICT (url) DO NOTHING
      RETURNING *`;
    return row;
  },
  async setArticleTopics(articleId: number, matches: { topicId: number; score: number }[]) {
    await sql.begin(async (tx) => {
      await tx`DELETE FROM article_topics WHERE article_id = ${articleId}`;
      if (matches.length === 0) return;
      const rows = matches.map((m) => ({
        article_id: articleId,
        topic_id: m.topicId,
        score: m.score,
      }));
      await tx`INSERT INTO article_topics ${tx(rows, 'article_id', 'topic_id', 'score')}`;
    });
  },
  async getArticle(id: number): Promise<(Article & { source_name: string; website_url: string }) | null> {
    const rows = await sql<(Article & { source_name: string; website_url: string })[]>`
      SELECT a.*, s.name AS source_name, s.website_url
      FROM articles a
      JOIN sources s ON s.id = a.source_id
      WHERE a.id = ${id}
      LIMIT 1`;
    return rows[0] ?? null;
  },
  async feed(opts: {
    onlyMatchingTopics: boolean;
    sortMode: 'newest' | 'relevance';
    maxAgeHours: number;
    sourceId?: number | null;
    topicId?: number | null;
    search?: string | null;
    limit?: number;
  }): Promise<FeedItem[]> {
    const limit = opts.limit ?? 200;
    const sourceId = opts.sourceId ?? null;
    const topicId = opts.topicId ?? null;
    const search = opts.search?.trim() ?? '';
    const rows = await sql<FeedItem[]>`
      WITH filtered AS (
        SELECT a.*, s.name AS source_name
        FROM articles a
        JOIN sources s ON s.id = a.source_id
        WHERE s.enabled = TRUE
          AND (a.published_at IS NULL
               OR a.published_at >= NOW() - (${opts.maxAgeHours}::int || ' hours')::interval)
          AND (${sourceId}::int IS NULL OR s.id = ${sourceId})
          AND (${topicId}::int IS NULL OR EXISTS (
            SELECT 1 FROM article_topics at2
            WHERE at2.article_id = a.id AND at2.topic_id = ${topicId}
          ))
          AND (
            ${search}::text = ''
            OR POSITION(LOWER(${search}) IN LOWER(a.title)) > 0
            OR POSITION(LOWER(${search}) IN LOWER(COALESCE(a.description, ''))) > 0
          )
      ),
      agg AS (
        SELECT f.*,
               COALESCE((
                 SELECT json_agg(json_build_object('id', t.id, 'name', t.name, 'score', at.score)
                                 ORDER BY at.score DESC)
                 FROM article_topics at
                 JOIN topics t ON t.id = at.topic_id
                 WHERE at.article_id = f.id
               ), '[]'::json) AS topics,
               COALESCE((
                 SELECT MAX(at.score)
                 FROM article_topics at
                 WHERE at.article_id = f.id
               ), 0) AS best_score
        FROM filtered f
      )
      SELECT * FROM agg
      WHERE (${opts.onlyMatchingTopics}::boolean = FALSE OR best_score > 0)
      ORDER BY
        CASE WHEN ${opts.sortMode} = 'relevance' THEN best_score END DESC NULLS LAST,
        published_at DESC NULLS LAST,
        created_at DESC
      LIMIT ${limit}`;
    return rows;
  },

  // settings
  async getSettings(): Promise<Settings> {
    const rows = await sql<Settings[]>`SELECT * FROM settings WHERE id = 1`;
    if (rows[0]) return rows[0];
    const [row] = await sql<Settings[]>`
      INSERT INTO settings (id) VALUES (1) RETURNING *`;
    return row;
  },
  async updateSettings(patch: Partial<Omit<Settings, 'id'>>) {
    const [row] = await sql<Settings[]>`
      UPDATE settings SET
        only_matching_topics  = COALESCE(${patch.only_matching_topics ?? null}, only_matching_topics),
        sort_mode             = COALESCE(${patch.sort_mode ?? null}, sort_mode),
        max_article_age_hours = COALESCE(${patch.max_article_age_hours ?? null}, max_article_age_hours)
      WHERE id = 1 RETURNING *`;
    return row;
  },
};
