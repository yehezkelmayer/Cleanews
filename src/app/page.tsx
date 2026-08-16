import Link from 'next/link';
import { repo } from '@/lib/repo';
import { maxAgeLabel, relativeTime, sortLabel, truncate } from '@/lib/format';
import { GlobeIcon, TelegramIcon, isTelegramSource } from './icons';

export const dynamic = 'force-dynamic';

export default async function FeedPage() {
  const settings = await repo.getSettings();
  const items = await repo.feed({
    onlyMatchingTopics: settings.only_matching_topics,
    sortMode: settings.sort_mode,
    maxAgeHours: settings.max_article_age_hours,
  });

  return (
    <main className="shell-feed">
      <div
        className="accent-strip row-between"
        style={{ marginBottom: 'var(--space-6)' }}
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
          כתבות · {sortLabel(settings.sort_mode)} ·{' '}
          {maxAgeLabel(settings.max_article_age_hours)}
        </div>
      </div>

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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'var(--space-4)',
          }}
        >
          {items.map((item) => {
            const telegram = isTelegramSource(item.url);
            const topic = item.topics[0];
            return (
              <Link
                key={item.id}
                href={`/article/${item.id}`}
                style={{ color: 'inherit', textDecoration: 'none' }}
              >
                <article
                  className="card elev-sm"
                  style={{
                    padding: 'var(--space-6)',
                    gap: 'var(--space-3)',
                    cursor: 'pointer',
                    height: '100%',
                  }}
                >
                  <div className="card-meta" style={{ fontSize: 12 }}>
                    {telegram ? <TelegramIcon /> : <GlobeIcon />}
                    <span>
                      {item.source_name}
                      {item.published_at && ` · ${relativeTime(item.published_at)}`}
                    </span>
                  </div>
                  <h2 className="card-title" style={{ fontSize: 22 }}>
                    {item.title}
                  </h2>
                  {(telegram || topic) && (
                    <div
                      style={{
                        display: 'flex',
                        gap: 'var(--space-2)',
                        flexWrap: 'wrap',
                      }}
                    >
                      {telegram && <span className="tag tag-outline">טלגרם</span>}
                      {topic && <span className="tag tag-accent">{topic.name}</span>}
                    </div>
                  )}
                  {item.description && (
                    <p
                      className="card-body"
                      style={{ fontSize: 15, lineHeight: 1.6 }}
                    >
                      {truncate(item.description, 280)}
                    </p>
                  )}
                </article>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
