-- Cleanews schema — Phase 1 multi-tenant.
-- Runs against a Supabase / PostgreSQL database.
-- All tables use IF NOT EXISTS so re-running is safe.

-- ─────────────────────── Global tables ───────────────────────

-- Master catalog of every RSS URL ever added by any user. Fetched once
-- per cron cycle, regardless of how many users subscribe.
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

-- Global article store, deduped by URL.
CREATE TABLE IF NOT EXISTS articles (
  id             SERIAL PRIMARY KEY,
  feed_source_id INTEGER NOT NULL REFERENCES feed_sources(id) ON DELETE CASCADE,
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
CREATE UNIQUE INDEX IF NOT EXISTS articles_url_uniq
  ON articles(url);
CREATE UNIQUE INDEX IF NOT EXISTS articles_canonical_uniq
  ON articles(canonical_url) WHERE canonical_url IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS articles_hash_uniq
  ON articles(content_hash) WHERE content_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS articles_source_pub_idx
  ON articles(feed_source_id, published_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS articles_pub_idx
  ON articles(published_at DESC NULLS LAST);

-- ─────────────────────── Per-user tables ───────────────────────
-- session_id is a UUID stored in the `cnsid` cookie. No `sessions`
-- table on purpose: session_id is a plain identifier tying rows
-- together. Sessions come into existence the first time a row is
-- written for them.

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
  onboarded_at           TIMESTAMPTZ,
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Idempotent add for previously-installed schemas
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS onboarded_at TIMESTAMPTZ;
