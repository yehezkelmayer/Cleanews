-- Cleanews schema (MVP, single-user)
-- Run against a Supabase / PostgreSQL database.

CREATE TABLE IF NOT EXISTS sources (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  website_url  TEXT NOT NULL,
  rss_url      TEXT NOT NULL UNIQUE,
  enabled      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS topics (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL UNIQUE,
  description  TEXT NOT NULL DEFAULT '',
  enabled      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS source_topics (
  source_id INTEGER NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  topic_id  INTEGER NOT NULL REFERENCES topics(id)  ON DELETE CASCADE,
  PRIMARY KEY (source_id, topic_id)
);

CREATE TABLE IF NOT EXISTS articles (
  id            SERIAL PRIMARY KEY,
  source_id     INTEGER NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  url           TEXT NOT NULL,
  canonical_url TEXT,
  published_at  TIMESTAMPTZ,
  description   TEXT,
  clean_text    TEXT,
  clean_html    TEXT,
  content_hash  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS articles_url_uniq          ON articles(url);
CREATE UNIQUE INDEX IF NOT EXISTS articles_canonical_uniq    ON articles(canonical_url) WHERE canonical_url IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS articles_hash_uniq         ON articles(content_hash)  WHERE content_hash  IS NOT NULL;
CREATE        INDEX IF NOT EXISTS articles_published_at_idx  ON articles(published_at DESC);
CREATE        INDEX IF NOT EXISTS articles_source_id_idx     ON articles(source_id);

CREATE TABLE IF NOT EXISTS article_topics (
  article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  topic_id   INTEGER NOT NULL REFERENCES topics(id)   ON DELETE CASCADE,
  score      REAL    NOT NULL DEFAULT 0,
  PRIMARY KEY (article_id, topic_id)
);

CREATE INDEX IF NOT EXISTS article_topics_topic_idx ON article_topics(topic_id);

CREATE TABLE IF NOT EXISTS settings (
  id                       INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  only_matching_topics     BOOLEAN NOT NULL DEFAULT TRUE,
  sort_mode                TEXT    NOT NULL DEFAULT 'newest' CHECK (sort_mode IN ('newest','relevance')),
  max_article_age_hours    INTEGER NOT NULL DEFAULT 72
);

INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
