# Cleanews

A personal, text-only news reader.

Cleanews pulls articles from RSS feeds you choose, extracts and cleans the
body server-side with Mozilla Readability, matches them against topics you
define, and shows a distraction-free feed. **Zero images, ever.** No
thumbnails, no favicons, no OpenGraph images, no video, no iframes.

## What it does

- Aggregates RSS feeds from sources you configure in Settings.
- Extracts the article body with `@mozilla/readability` and sanitizes it
  against a strict allowlist (`p, h1-h4, ul, ol, li, blockquote, strong,
  em, a, br` only).
- Matches each article against your topics using a simple keyword/token
  overlap scorer. Matcher is pluggable — see `src/lib/matcher.ts`.
- Stores the cleaned article body, so opening an article just reads from
  Postgres — no re-fetch, no images loaded client-side.
- Runs ingestion on a schedule via `/api/cron/fetch-news` (Vercel Cron).

## Architecture

```
Next.js App (App Router, TS, Tailwind)
│
├── /            Feed page
├── /article/[id] Reader page (text-only)
├── /settings   Sources · Topics · Preferences
│
└── /api/cron/fetch-news  Ingestion endpoint (secret-protected)

lib/
├── db.ts         postgres.js connection
├── repo.ts       Data access
├── rss.ts        RSS fetching
├── extract.ts    fetch + Readability
├── sanitize.ts   Strict HTML allowlist (JSDOM)
├── matcher.ts    Pluggable TopicMatcher (keyword MVP)
├── ingest.ts     Pipeline orchestrator
├── hash.ts       Dedup helpers
└── types.ts / validation.ts
```

## Local setup

```bash
npm install
cp .env.example .env
# fill DATABASE_URL and CRON_SECRET

npm run db:migrate    # apply schema
npm run db:seed       # optional: sample topics + disabled placeholder sources
npm run ingest        # one-shot ingestion from your terminal
npm run dev           # http://localhost:3000
```

## Environment variables

| Name                    | Required | Description                                                     |
| ----------------------- | -------- | --------------------------------------------------------------- |
| `DATABASE_URL`          | yes      | Supabase / PostgreSQL connection string.                        |
| `CRON_SECRET`           | yes\*    | Bearer token to authorize the cron endpoint. \*Required in prod.|
| `TOPIC_MATCH_THRESHOLD` | no       | Minimum score to save a topic match. Default `0.3`.             |

## Database

Uses PostgreSQL (Supabase-friendly). The schema is applied automatically on
the first database query and can also be applied explicitly by
`scripts/migrate.ts`. A SQL copy for manual administration lives in
`src/lib/schema.sql`.

Tables: `sources`, `topics`, `source_topics`, `articles`, `article_topics`,
`settings`. See the SQL file for details.

To use Supabase, copy the pooler connection string from
Project Settings → Database → Connection Pooling (Session mode) and set it
as `DATABASE_URL`.

## Adding news sources

Open `/settings` and use **Add Source**:

- **Name** – how it shows up in the feed.
- **Website URL** – link to the publication.
- **RSS URL** – the feed to poll.
- **Enabled** – on to include in ingestion.

Optionally link a source to specific topics (in the source's card). If no
topics are linked, articles from that source are matched against all
enabled topics.

## How ingestion works

1. Load all enabled sources.
2. For each source, fetch the RSS feed and iterate items.
3. Skip items whose `url` is already in `articles` (fast pre-check).
4. Fetch the article HTML, run Readability, strip all disallowed tags.
5. Deduplicate again by canonical URL and content hash.
6. Insert the row (`ON CONFLICT (url) DO NOTHING`).
7. Run the topic matcher against `title + description + body`.
8. Persist matches whose score >= `TOPIC_MATCH_THRESHOLD`.

A failure in one source is logged and does not stop the others.

## How cron works

Vercel Cron hits `POST /api/cron/fetch-news` on the schedule declared in
`vercel.json` (`*/30 * * * *` by default).

The endpoint requires a secret:

```
Authorization: Bearer $CRON_SECRET
# or:
POST /api/cron/fetch-news?secret=...
```

Response:

```json
{
  "sourcesChecked": 8,
  "articlesFound": 53,
  "newArticles": 12,
  "errors": 1,
  "errorDetails": [{ "source": "Globes", "message": "..." }]
}
```

You can also run ingestion locally: `npm run ingest`.

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import it in Vercel.
3. Add env vars: `DATABASE_URL`, `CRON_SECRET`.
4. Deploy. `vercel.json` registers the cron automatically.
5. The first database request applies the idempotent schema automatically.
   You can also run the SQL in `src/lib/schema.sql` manually, or run
   `npm run db:migrate` with the production `DATABASE_URL`.

## Tests

```bash
npm run test         # sanitizer, extractor, dedup, matcher
npm run lint
npm run typecheck
```

The sanitizer test suite is the guardrail for the "zero images" promise —
if any regression re-introduces `<img>`, `<iframe>`, `<video>`, `<picture>`,
`<svg>`, `<canvas>`, `<audio>`, `<figure>` into the rendered body, tests fail.

## Future embeddings

The matcher is a `TopicMatcher` interface with a `KeywordTopicMatcher`
implementation. Swapping in an embedding-based matcher
(e.g. `multilingual-e5-small`) is a matter of implementing the interface
and pointing `defaultMatcher` at it. No other module needs to change.
