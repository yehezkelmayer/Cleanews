import Link from 'next/link';
import { repo } from '@/lib/repo';
import { maxAgeLabel, relativeTime, sortLabel, truncate } from '@/lib/format';
import { GlobeIcon, TelegramIcon, isTelegramSource } from './icons';
import { FeedFilters } from './FeedFilters';
import type { FeedItem } from '@/lib/types';

export const dynamic = 'force-dynamic';

type SP = Record<string, string | string[] | undefined>;

function parseIntParam(v: string | string[] | undefined): number | null {
  if (typeof v !== 'string') return null;
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const sourceId = parseIntParam(sp.source);
  const topicId = parseIntParam(sp.topic);
  const sortOverride =
    sp.sort === 'newest' || sp.sort === 'relevance' ? sp.sort : null;

  const [settings, sources, topics] = await Promise.all([
    repo.getSettings(),
    repo.enabledSources(),
    repo.enabledTopics(),
  ]);

  const sortMode = sortOverride ?? settings.sort_mode;

  const items = await repo.feed({
    onlyMatchingTopics: settings.only_matching_topics,
    sortMode,
    maxAgeHours: settings.max_article_age_hours,
    sourceId,
    topicId,
  });

  const websiteItems = items.filter((i) => !isTelegramSource(i.url));
  const telegramItems = items.filter((i) => isTelegramSource(i.url));

  return (
    <main className="shell-feed">
      <div
        className="accent-strip row-between"
        style={{ marginBottom: 'var(--space-4)' }}
      >
        <h1 style={{ margin: 0 }}>פיד הכתבות</h1>
        <div className="text-muted" style={{ fontSize: 13 }}>
          <strong
            style={{
              color: 'var(--color-accent-700)',
              fontFamily: 'var(--font-heading)',
            }}
          >
            {items.length}
          </strong>{' '}
          כתבות · {sortLabel(sortMode)} · {maxAgeLabel(settings.max_article_age_hours)}
        </div>
      </div>

      <FeedFilters
        sources={sources.map((s) => ({ id: s.id, name: s.name }))}
        topics={topics.map((t) => ({ id: t.id, name: t.name }))}
        sourceId={sourceId}
        topicId={topicId}
        sortMode={sortMode}
      />

      {items.length === 0 ? (
        <div
          className="card"
          style={{ padding: 'var(--space-6)', textAlign: 'center' }}
        >
          <p className="card-body" style={{ margin: 0 }}>
            אין כתבות להצגה כרגע. הוסיפו מקורות ונושאים ב
            <Link href="/settings">הגדרות</Link>.
          </p>
        </div>
      ) : (
        <div className="feed-layout">
          <section className="feed-main">
            <h2 className="feed-column-title">אתרי חדשות</h2>
            {websiteItems.length === 0 ? (
              <div className="card" style={{ padding: 'var(--space-4)' }}>
                <p className="card-body" style={{ margin: 0 }}>
                  אין כתבות מאתרי חדשות תואמים לסינון הנוכחי.
                </p>
              </div>
            ) : (
              <div className="feed-grid">
                {websiteItems.map((item) => (
                  <FeedCard key={item.id} item={item} kind="website" />
                ))}
              </div>
            )}
          </section>

          <aside className="feed-sidebar">
            <h2 className="feed-column-title">
              <TelegramIcon size={15} />
              <span style={{ marginInlineStart: 6 }}>ערוצי טלגרם</span>
            </h2>
            {telegramItems.length === 0 ? (
              <div className="card" style={{ padding: 'var(--space-4)' }}>
                <p className="card-body" style={{ margin: 0 }}>
                  אין ציוצים חדשים מטלגרם בסינון הנוכחי.
                </p>
              </div>
            ) : (
              <div className="feed-sidebar-list">
                {telegramItems.map((item) => (
                  <FeedCard key={item.id} item={item} kind="telegram" />
                ))}
              </div>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}

function FeedCard({ item, kind }: { item: FeedItem; kind: 'website' | 'telegram' }) {
  const topic = item.topics[0];
  const isTelegram = kind === 'telegram';
  return (
    <Link
      href={`/article/${item.id}`}
      style={{ color: 'inherit', textDecoration: 'none' }}
    >
      <article
        className="card elev-sm"
        style={{
          padding: isTelegram ? 'var(--space-4)' : 'var(--space-6)',
          gap: 'var(--space-3)',
          cursor: 'pointer',
          height: '100%',
        }}
      >
        <div className="card-meta" style={{ fontSize: 12 }}>
          {isTelegram ? <TelegramIcon /> : <GlobeIcon />}
          <span>
            {item.source_name}
            {item.published_at && ` · ${relativeTime(item.published_at)}`}
          </span>
        </div>
        <h2 className="card-title" style={{ fontSize: isTelegram ? 17 : 22 }}>
          {item.title}
        </h2>
        {(isTelegram || topic) && (
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {isTelegram && <span className="tag tag-outline">טלגרם</span>}
            {topic && <span className="tag tag-accent">{topic.name}</span>}
          </div>
        )}
        {item.description && (
          <p
            className="card-body"
            style={{ fontSize: isTelegram ? 13 : 15, lineHeight: 1.6 }}
          >
            {truncate(item.description, isTelegram ? 180 : 280)}
          </p>
        )}
      </article>
    </Link>
  );
}
