-- ═══════════════════════════════════════════════════════════════════
-- Cleanews Phase 1 multi-tenant migration
--
-- Copy this ENTIRE file into Supabase → SQL Editor → New query →
-- Run. Safe to re-run: every step is idempotent (IF NOT EXISTS /
-- ON CONFLICT DO NOTHING / ALTER … IF EXISTS).
--
-- What it does:
--   1. Creates the new schema (feed_sources, user_sources,
--      user_topics, user_settings; and articles if it doesn't
--      exist yet).
--   2. Copies your existing single-user data into the new tables
--      under a legacy session UUID (00000000-0000-0000-0000-000000000001).
--   3. Renames articles.source_id → feed_source_id and re-FKs it.
--
-- After running, visit ONCE in your browser to claim the legacy
-- session as yours:
--   https://<your-app>.vercel.app/api/adopt-session?token=00000000-0000-0000-0000-000000000001
-- ═══════════════════════════════════════════════════════════════════

-- ─── 1. New schema ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS feed_sources (
  id                   SERIAL PRIMARY KEY,
  rss_url              TEXT NOT NULL UNIQUE,
  website_url          TEXT NOT NULL,
  canonical_name       TEXT NOT NULL,
  last_fetched_at      TIMESTAMPTZ,
  fetch_failure_count  INTEGER NOT NULL DEFAULT 0,
  last_error           TEXT,
  enabled_globally     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS feed_sources_next_fetch_idx
  ON feed_sources(last_fetched_at NULLS FIRST)
  WHERE enabled_globally = TRUE;

CREATE TABLE IF NOT EXISTS articles (
  id             SERIAL PRIMARY KEY,
  feed_source_id INTEGER,   -- FK added below (nullable temporarily for pre-existing DBs)
  title          TEXT NOT NULL,
  url            TEXT NOT NULL,
  canonical_url  TEXT,
  published_at   TIMESTAMPTZ,
  description    TEXT,
  clean_text     TEXT,
  clean_html     TEXT,
  content_hash   TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS articles_url_uniq       ON articles(url);
CREATE UNIQUE INDEX IF NOT EXISTS articles_canonical_uniq ON articles(canonical_url) WHERE canonical_url IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS articles_hash_uniq      ON articles(content_hash) WHERE content_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS articles_pub_idx               ON articles(published_at DESC NULLS LAST);

CREATE TABLE IF NOT EXISTS user_sources (
  session_id     UUID NOT NULL,
  feed_source_id INTEGER NOT NULL REFERENCES feed_sources(id) ON DELETE CASCADE,
  enabled        BOOLEAN NOT NULL DEFAULT TRUE,
  display_name   TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (session_id, feed_source_id)
);
CREATE INDEX IF NOT EXISTS user_sources_session_idx ON user_sources(session_id);

CREATE TABLE IF NOT EXISTS user_topics (
  id           SERIAL PRIMARY KEY,
  session_id   UUID NOT NULL,
  name         TEXT NOT NULL,
  description  TEXT NOT NULL DEFAULT '',
  enabled      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (session_id, name)
);
CREATE INDEX IF NOT EXISTS user_topics_session_enabled_idx
  ON user_topics(session_id) WHERE enabled = TRUE;

CREATE TABLE IF NOT EXISTS user_settings (
  session_id             UUID PRIMARY KEY,
  only_matching_topics   BOOLEAN NOT NULL DEFAULT FALSE,
  sort_mode              TEXT    NOT NULL DEFAULT 'newest'
    CHECK (sort_mode IN ('newest','relevance')),
  max_article_age_hours  INTEGER NOT NULL DEFAULT 72,
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 2. Copy legacy data (if the old tables exist) ─────────────────
-- All INSERTs use ON CONFLICT DO NOTHING so re-runs are safe.

DO $$
DECLARE
  legacy_session UUID := '00000000-0000-0000-0000-000000000001'::uuid;
BEGIN
  -- Copy old sources → feed_sources (dedup by rss_url).
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_name = 'sources' AND table_schema = 'public') THEN
    INSERT INTO feed_sources (id, rss_url, website_url, canonical_name, created_at, updated_at)
    SELECT id, rss_url, website_url, name, created_at, updated_at
    FROM sources
    ON CONFLICT (rss_url) DO NOTHING;

    -- Bump SERIAL sequence past copied IDs.
    PERFORM setval(
      pg_get_serial_sequence('feed_sources', 'id'),
      GREATEST((SELECT COALESCE(MAX(id), 0) FROM feed_sources), 1),
      true
    );

    -- Subscribe the legacy session to every existing source.
    INSERT INTO user_sources (session_id, feed_source_id, enabled, created_at)
    SELECT legacy_session, fs.id, s.enabled, s.created_at
    FROM sources s
    JOIN feed_sources fs ON fs.rss_url = s.rss_url
    ON CONFLICT (session_id, feed_source_id) DO NOTHING;
  END IF;

  -- Copy old topics → user_topics.
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_name = 'topics' AND table_schema = 'public') THEN
    INSERT INTO user_topics (session_id, name, description, enabled, created_at, updated_at)
    SELECT legacy_session, name, description, enabled, created_at, updated_at
    FROM topics
    ON CONFLICT (session_id, name) DO NOTHING;
  END IF;

  -- Copy old settings (id = 1 row) → user_settings.
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_name = 'settings' AND table_schema = 'public') THEN
    INSERT INTO user_settings (session_id, only_matching_topics, sort_mode, max_article_age_hours)
    SELECT legacy_session, only_matching_topics, sort_mode, max_article_age_hours
    FROM settings WHERE id = 1
    ON CONFLICT (session_id) DO NOTHING;
  END IF;
END $$;

-- ─── 3. Reshape articles: source_id → feed_source_id ───────────────
-- Runs only if the old column still exists.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'source_id' AND table_schema = 'public'
  ) THEN
    ALTER TABLE articles DROP CONSTRAINT IF EXISTS articles_source_id_fkey;
    ALTER TABLE articles RENAME COLUMN source_id TO feed_source_id;
  END IF;
END $$;

-- Make sure the FK exists in either scenario (fresh install or after rename).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'articles_feed_source_id_fkey' AND table_name = 'articles'
  ) THEN
    ALTER TABLE articles
      ADD CONSTRAINT articles_feed_source_id_fkey
      FOREIGN KEY (feed_source_id) REFERENCES feed_sources(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS articles_source_pub_idx
  ON articles(feed_source_id, published_at DESC NULLS LAST);

-- ─── 4. Show what was migrated ────────────────────────────────────
SELECT 'feed_sources (global)'    AS what, COUNT(*)::text AS count FROM feed_sources
UNION ALL
SELECT 'user_sources (legacy)',    COUNT(*)::text FROM user_sources
  WHERE session_id = '00000000-0000-0000-0000-000000000001'::uuid
UNION ALL
SELECT 'user_topics  (legacy)',    COUNT(*)::text FROM user_topics
  WHERE session_id = '00000000-0000-0000-0000-000000000001'::uuid
UNION ALL
SELECT 'user_settings (legacy)',   COUNT(*)::text FROM user_settings
  WHERE session_id = '00000000-0000-0000-0000-000000000001'::uuid
UNION ALL
SELECT 'articles (global)',        COUNT(*)::text FROM articles;
