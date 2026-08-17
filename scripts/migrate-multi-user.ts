/**
 * One-shot migration: single-user schema → Phase 1 multi-tenant schema.
 *
 * Safe to re-run: every INSERT uses ON CONFLICT DO NOTHING, and old
 * tables are left in place (untouched) so nothing is destroyed.
 *
 * Run:
 *   DATABASE_URL=... npx tsx scripts/migrate-multi-user.ts
 *
 * At the end it prints the legacy session UUID and a URL you should
 * visit once from your browser to reclaim ownership of the existing data.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import postgres from 'postgres';

const LEGACY_SESSION_ID = process.env.LEGACY_SESSION_ID ?? '00000000-0000-0000-0000-000000000001';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required');
  const sql = postgres(url, { prepare: false, max: 1 });

  console.log('1) Applying new schema (idempotent)…');
  const ddl = readFileSync(resolve('src/lib/schema.sql'), 'utf8');
  await sql.unsafe(ddl);

  const hasOldSources = await sql<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_name = 'sources' AND table_schema = 'public'
    ) AS exists`;
  if (!hasOldSources[0]?.exists) {
    console.log('No legacy `sources` table found — schema-only apply. Done.');
    await sql.end();
    return;
  }

  console.log('2) Copying sources → feed_sources (deduped by rss_url)…');
  await sql`
    INSERT INTO feed_sources (id, rss_url, website_url, canonical_name, created_at, updated_at)
    SELECT id, rss_url, website_url, name, created_at, updated_at
    FROM sources
    ON CONFLICT (rss_url) DO NOTHING
  `;
  // Bump the SERIAL sequence past the copied IDs so future inserts don't collide.
  await sql`
    SELECT setval(
      pg_get_serial_sequence('feed_sources', 'id'),
      GREATEST((SELECT COALESCE(MAX(id), 0) FROM feed_sources), 1),
      true
    )
  `;

  console.log(`3) Creating user_sources for legacy session ${LEGACY_SESSION_ID}…`);
  await sql`
    INSERT INTO user_sources (session_id, feed_source_id, enabled, created_at)
    SELECT ${LEGACY_SESSION_ID}::uuid, fs.id, s.enabled, s.created_at
    FROM sources s
    JOIN feed_sources fs ON fs.rss_url = s.rss_url
    ON CONFLICT (session_id, feed_source_id) DO NOTHING
  `;

  const hasOldTopics = await sql<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_name = 'topics' AND table_schema = 'public'
    ) AS exists`;
  if (hasOldTopics[0]?.exists) {
    console.log('4) Copying topics → user_topics (under legacy session)…');
    await sql`
      INSERT INTO user_topics (session_id, name, description, enabled, created_at, updated_at)
      SELECT ${LEGACY_SESSION_ID}::uuid, name, description, enabled, created_at, updated_at
      FROM topics
      ON CONFLICT (session_id, name) DO NOTHING
    `;
  }

  const hasOldSettings = await sql<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_name = 'settings' AND table_schema = 'public'
    ) AS exists`;
  if (hasOldSettings[0]?.exists) {
    console.log('5) Copying settings → user_settings (under legacy session)…');
    await sql`
      INSERT INTO user_settings (session_id, only_matching_topics, sort_mode, max_article_age_hours)
      SELECT ${LEGACY_SESSION_ID}::uuid, only_matching_topics, sort_mode, max_article_age_hours
      FROM settings WHERE id = 1
      ON CONFLICT (session_id) DO NOTHING
    `;
  }

  const hasOldArticles = await sql<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'articles' AND column_name = 'source_id' AND table_schema = 'public'
    ) AS exists`;
  if (hasOldArticles[0]?.exists) {
    console.log('6) Legacy articles.source_id column detected — reshaping articles…');
    // The old articles table has `source_id` referencing sources(id). We migrated
    // sources → feed_sources preserving the id, so the FK targets line up.
    await sql`ALTER TABLE articles RENAME COLUMN source_id TO feed_source_id`;
    await sql`
      ALTER TABLE articles
      DROP CONSTRAINT IF EXISTS articles_source_id_fkey
    `;
    await sql`
      ALTER TABLE articles
      ADD CONSTRAINT articles_feed_source_id_fkey
      FOREIGN KEY (feed_source_id) REFERENCES feed_sources(id) ON DELETE CASCADE
    `;
    console.log('   articles.source_id renamed to feed_source_id and re-FK-d.');
  }

  const sourcesCount = await sql<{ count: string }[]>`SELECT COUNT(*) FROM feed_sources`;
  const usCount      = await sql<{ count: string }[]>`SELECT COUNT(*) FROM user_sources WHERE session_id = ${LEGACY_SESSION_ID}`;
  const topicsCount  = await sql<{ count: string }[]>`SELECT COUNT(*) FROM user_topics WHERE session_id = ${LEGACY_SESSION_ID}`;

  console.log('\n─── Migration summary ───');
  console.log(`feed_sources (global):        ${sourcesCount[0].count}`);
  console.log(`user_sources (legacy owner):  ${usCount[0].count}`);
  console.log(`user_topics  (legacy owner):  ${topicsCount[0].count}`);
  console.log(`\nLegacy session ID: ${LEGACY_SESSION_ID}`);
  console.log('\nTo reclaim ownership of this data from your browser, visit:');
  console.log(`  https://<your-app>.vercel.app/api/adopt-session?token=${LEGACY_SESSION_ID}`);
  console.log('\nAfter that, cnsid cookie is set and /settings will show your existing sources.');
  console.log('Old tables (sources, topics, settings, source_topics, article_topics) are untouched — drop them when confident.');

  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
