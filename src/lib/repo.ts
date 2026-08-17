import { sql } from './db';
import type {
  Article,
  FeedItem,
  FeedSource,
  UserSettings,
  UserSourceRow,
  UserTopic,
} from './types';
import { defaultMatcher, DEFAULT_MATCH_THRESHOLD } from './matcher';

const DEFAULT_SETTINGS = {
  only_matching_topics: false,
  sort_mode: 'newest' as const,
  max_article_age_hours: 72,
};

export const repo = {
  // ────────────────── feed_sources (global) ──────────────────

  async feedSourceUpsert(input: {
    rss_url: string;
    website_url: string;
    canonical_name: string;
  }): Promise<FeedSource> {
    const [row] = await sql<FeedSource[]>`
      INSERT INTO feed_sources (rss_url, website_url, canonical_name)
      VALUES (${input.rss_url}, ${input.website_url}, ${input.canonical_name})
      ON CONFLICT (rss_url) DO UPDATE SET updated_at = NOW()
      RETURNING *`;
    return row;
  },

  async feedSourceById(id: number): Promise<FeedSource | null> {
    const rows = await sql<FeedSource[]>`SELECT * FROM feed_sources WHERE id = ${id} LIMIT 1`;
    return rows[0] ?? null;
  },

  async feedSourceByRss(rssUrl: string): Promise<FeedSource | null> {
    const rows = await sql<FeedSource[]>`SELECT * FROM feed_sources WHERE rss_url = ${rssUrl} LIMIT 1`;
    return rows[0] ?? null;
  },

  /**
   * All globally-enabled feed sources, oldest-fetched-first. The cron
   * picks the head of this list every cycle so nothing starves.
   */
  async feedSourcesDueForFetch(limit = 100): Promise<FeedSource[]> {
    return await sql<FeedSource[]>`
      SELECT * FROM feed_sources
      WHERE enabled_globally = TRUE
      ORDER BY last_fetched_at NULLS FIRST
      LIMIT ${limit}`;
  },

  /**
   * Enabled feed_sources subscribed to by this specific session — used
   * by the "Fetch news now" button so it only touches (and reports
   * errors for) the sources the current user actually cares about.
   */
  async feedSourcesForSession(sessionId: string): Promise<FeedSource[]> {
    return await sql<FeedSource[]>`
      SELECT fs.*
      FROM feed_sources fs
      JOIN user_sources us ON us.feed_source_id = fs.id
      WHERE us.session_id = ${sessionId}
        AND us.enabled = TRUE
        AND fs.enabled_globally = TRUE
      ORDER BY fs.last_fetched_at NULLS FIRST`;
  },

  async feedSourceMarkFetched(id: number, ok: boolean, error?: string) {
    if (ok) {
      await sql`
        UPDATE feed_sources
        SET last_fetched_at = NOW(),
            fetch_failure_count = 0,
            last_error = NULL,
            updated_at = NOW()
        WHERE id = ${id}`;
    } else {
      await sql`
        UPDATE feed_sources
        SET last_fetched_at = NOW(),
            fetch_failure_count = fetch_failure_count + 1,
            last_error = ${error ?? null},
            enabled_globally = CASE WHEN fetch_failure_count + 1 >= 10 THEN FALSE ELSE enabled_globally END,
            updated_at = NOW()
        WHERE id = ${id}`;
    }
  },

  // ────────────────── articles (global) ──────────────────

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

  async insertArticle(a: Omit<Article, 'id' | 'created_at'>): Promise<Article | undefined> {
    const [row] = await sql<Article[]>`
      INSERT INTO articles (feed_source_id, title, url, canonical_url, published_at,
                            description, clean_text, clean_html, content_hash)
      VALUES (${a.feed_source_id}, ${a.title}, ${a.url}, ${a.canonical_url},
              ${a.published_at}, ${a.description}, ${a.clean_text},
              ${a.clean_html}, ${a.content_hash})
      ON CONFLICT (url) DO NOTHING
      RETURNING *`;
    return row;
  },

  async getArticle(
    id: number,
  ): Promise<(Article & { source_name: string; website_url: string }) | null> {
    const rows = await sql<
      (Article & { source_name: string; website_url: string })[]
    >`
      SELECT a.*, fs.canonical_name AS source_name, fs.website_url
      FROM articles a
      JOIN feed_sources fs ON fs.id = a.feed_source_id
      WHERE a.id = ${id}
      LIMIT 1`;
    return rows[0] ?? null;
  },

  // ────────────────── user_sources (per session) ──────────────────

  async userSources(sessionId: string): Promise<UserSourceRow[]> {
    return await sql<UserSourceRow[]>`
      SELECT us.feed_source_id, us.session_id, us.enabled, us.display_name,
             fs.rss_url, fs.website_url, fs.canonical_name
      FROM user_sources us
      JOIN feed_sources fs ON fs.id = us.feed_source_id
      WHERE us.session_id = ${sessionId}
      ORDER BY fs.canonical_name ASC`;
  },

  async userEnabledSourceIds(sessionId: string): Promise<number[]> {
    const rows = await sql<{ feed_source_id: number }[]>`
      SELECT us.feed_source_id
      FROM user_sources us
      JOIN feed_sources fs ON fs.id = us.feed_source_id
      WHERE us.session_id = ${sessionId} AND us.enabled = TRUE AND fs.enabled_globally = TRUE`;
    return rows.map((r) => r.feed_source_id);
  },

  async userSourceAdd(sessionId: string, feedSourceId: number, opts?: { enabled?: boolean; displayName?: string }) {
    const enabled = opts?.enabled ?? true;
    const displayName = opts?.displayName ?? null;
    await sql`
      INSERT INTO user_sources (session_id, feed_source_id, enabled, display_name)
      VALUES (${sessionId}, ${feedSourceId}, ${enabled}, ${displayName})
      ON CONFLICT (session_id, feed_source_id) DO NOTHING`;
  },

  async userSourceRemove(sessionId: string, feedSourceId: number) {
    await sql`DELETE FROM user_sources WHERE session_id = ${sessionId} AND feed_source_id = ${feedSourceId}`;
  },

  async userSourceSetEnabled(sessionId: string, feedSourceId: number, enabled: boolean) {
    await sql`
      UPDATE user_sources SET enabled = ${enabled}
      WHERE session_id = ${sessionId} AND feed_source_id = ${feedSourceId}`;
  },

  // ────────────────── user_topics (per session) ──────────────────

  async userTopics(sessionId: string, opts?: { onlyEnabled?: boolean }): Promise<UserTopic[]> {
    if (opts?.onlyEnabled) {
      return await sql<UserTopic[]>`
        SELECT * FROM user_topics
        WHERE session_id = ${sessionId} AND enabled = TRUE
        ORDER BY name ASC`;
    }
    return await sql<UserTopic[]>`
      SELECT * FROM user_topics WHERE session_id = ${sessionId} ORDER BY name ASC`;
  },

  async userTopicCreate(sessionId: string, input: { name: string; description: string; enabled: boolean }): Promise<UserTopic | undefined> {
    const [row] = await sql<UserTopic[]>`
      INSERT INTO user_topics (session_id, name, description, enabled)
      VALUES (${sessionId}, ${input.name}, ${input.description}, ${input.enabled})
      ON CONFLICT (session_id, name) DO NOTHING
      RETURNING *`;
    return row;
  },

  async userTopicUpdate(sessionId: string, id: number, patch: Partial<Omit<UserTopic, 'id' | 'session_id'>>): Promise<UserTopic | undefined> {
    const [row] = await sql<UserTopic[]>`
      UPDATE user_topics SET
        name        = COALESCE(${patch.name ?? null}, name),
        description = COALESCE(${patch.description ?? null}, description),
        enabled     = COALESCE(${patch.enabled ?? null}, enabled),
        updated_at  = NOW()
      WHERE id = ${id} AND session_id = ${sessionId}
      RETURNING *`;
    return row;
  },

  async userTopicDelete(sessionId: string, id: number) {
    await sql`DELETE FROM user_topics WHERE id = ${id} AND session_id = ${sessionId}`;
  },

  async userTopicSetEnabled(sessionId: string, id: number, enabled: boolean) {
    await sql`
      UPDATE user_topics SET enabled = ${enabled}, updated_at = NOW()
      WHERE id = ${id} AND session_id = ${sessionId}`;
  },

  // ────────────────── user_settings (per session) ──────────────────

  async userSettings(sessionId: string): Promise<UserSettings> {
    const rows = await sql<UserSettings[]>`SELECT * FROM user_settings WHERE session_id = ${sessionId}`;
    if (rows[0]) return rows[0];
    const [row] = await sql<UserSettings[]>`
      INSERT INTO user_settings (session_id)
      VALUES (${sessionId})
      ON CONFLICT (session_id) DO UPDATE SET updated_at = NOW()
      RETURNING *`;
    return row ?? {
      session_id: sessionId,
      ...DEFAULT_SETTINGS,
      updated_at: new Date().toISOString(),
    };
  },

  async userSettingsUpdate(sessionId: string, patch: Partial<Omit<UserSettings, 'session_id' | 'updated_at'>>) {
    // Ensure the row exists first (so UPDATE hits something).
    await sql`
      INSERT INTO user_settings (session_id)
      VALUES (${sessionId})
      ON CONFLICT (session_id) DO NOTHING`;
    await sql`
      UPDATE user_settings SET
        only_matching_topics  = COALESCE(${patch.only_matching_topics ?? null}, only_matching_topics),
        sort_mode             = COALESCE(${patch.sort_mode ?? null}, sort_mode),
        max_article_age_hours = COALESCE(${patch.max_article_age_hours ?? null}, max_article_age_hours),
        updated_at            = NOW()
      WHERE session_id = ${sessionId}`;
  },

  // ────────────────── feed (per session, per-query topic matching) ──────────────────

  async feed(
    sessionId: string,
    opts: {
      onlyMatchingTopics: boolean;
      sortMode: 'newest' | 'relevance';
      maxAgeHours: number;
      sourceId?: number | null;
      topicId?: number | null;
      limit?: number;
    },
  ): Promise<FeedItem[]> {
    const limit = opts.limit ?? 200;
    const candidateLimit = Math.max(limit, 500);
    const sourceId = opts.sourceId ?? null;

    // Candidate articles: only from the user's enabled sources, within max age.
    const candidates = await sql<
      (Article & { source_name: string; website_url: string })[]
    >`
      SELECT a.*, fs.canonical_name AS source_name, fs.website_url
      FROM articles a
      JOIN feed_sources fs ON fs.id = a.feed_source_id
      JOIN user_sources us ON us.feed_source_id = fs.id AND us.session_id = ${sessionId}
      WHERE us.enabled = TRUE
        AND fs.enabled_globally = TRUE
        AND (a.published_at IS NULL
             OR a.published_at >= NOW() - (${opts.maxAgeHours}::int || ' hours')::interval)
        AND (${sourceId}::int IS NULL OR fs.id = ${sourceId})
      ORDER BY a.published_at DESC NULLS LAST
      LIMIT ${candidateLimit}`;

    // Topics used for scoring (empty = no scoring, best_score stays 0).
    const allTopics = await this.userTopics(sessionId, { onlyEnabled: true });
    const scoringTopics = opts.topicId
      ? allTopics.filter((t) => t.id === opts.topicId)
      : allTopics;
    const topicById = new Map(allTopics.map((t) => [t.id, t]));

    // Compute matches for each candidate in-process. For a few hundred
    // articles × a handful of topics this is well under a hundred ms.
    const scored: FeedItem[] = [];
    for (const a of candidates) {
      let matches: { topicId: number; score: number }[] = [];
      if (scoringTopics.length > 0) {
        matches = await defaultMatcher.match(
          { title: a.title, description: a.description ?? '', text: a.clean_text ?? '' },
          scoringTopics,
        );
        matches = matches.filter((m) => m.score >= DEFAULT_MATCH_THRESHOLD);
      }
      const best_score = matches.reduce((max, m) => (m.score > max ? m.score : max), 0);
      const topics = matches
        .map((m) => ({ id: m.topicId, name: topicById.get(m.topicId)?.name ?? '', score: m.score }))
        .filter((t) => t.name !== '')
        .sort((x, y) => y.score - x.score);
      scored.push({ ...a, source_name: a.source_name, website_url: a.website_url, topics, best_score });
    }

    let filtered = scored;
    if (opts.topicId !== undefined && opts.topicId !== null) {
      filtered = filtered.filter((i) => i.topics.some((t) => t.id === opts.topicId));
    }
    if (opts.onlyMatchingTopics) {
      filtered = filtered.filter((i) => i.best_score > 0);
    }

    filtered.sort((a, b) => {
      if (opts.sortMode === 'relevance') {
        const scoreDiff = b.best_score - a.best_score;
        if (scoreDiff !== 0) return scoreDiff;
      }
      const at = a.published_at ? Date.parse(a.published_at) : 0;
      const bt = b.published_at ? Date.parse(b.published_at) : 0;
      return bt - at;
    });

    return filtered.slice(0, limit);
  },
};
