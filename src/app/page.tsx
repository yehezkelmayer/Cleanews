import Link from 'next/link';
import { repo } from '@/lib/repo';
import { relativeTime, truncate } from '@/lib/format';
import { GlobeIcon, TelegramIcon, isTelegramSource } from './icons';
import { FeedToolbar } from './FeedToolbar';
import type { FeedItem } from '@/lib/types';

export const dynamic = 'force-dynamic';

type SP = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string | null {
  if (typeof v === 'string') return v;
  return null;
}

function isLive(iso: string | null): boolean {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return false;
  return Date.now() - t < 60 * 60 * 1000;
}

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const q = (first(sp.q) ?? '').trim();
  const sortParam = first(sp.sort);
  const onlyParam = first(sp.only);
  const ageParam = first(sp.age);

  const settings = await repo.getSettings();
  const sortMode: 'newest' | 'relevance' =
    sortParam === 'relevance' ? 'relevance' : 'newest';
  const onlyMatchingTopics =
    onlyParam === 'on' ? true : onlyParam === 'off' ? false : settings.only_matching_topics;
  const maxAgeHours = ageParam
    ? parseInt(ageParam, 10) || settings.max_article_age_hours
    : settings.max_article_age_hours;

  const items = await repo.feed({
    onlyMatchingTopics,
    sortMode,
    maxAgeHours,
    search: q,
  });

  const websiteAll = items.filter((i) => !isTelegramSource(i.url));
  const telegramItems = items.filter((i) => isTelegramSource(i.url));

  const featured = websiteAll[0] ?? null;
  const restWebsite = featured ? websiteAll.slice(1) : websiteAll;

  return (
    <main className="shell-feed">
      <FeedToolbar
        initialSearch={q}
        sortMode={sortMode}
        onlyMatchingTopics={onlyMatchingTopics}
        maxAgeHours={maxAgeHours}
      />

      {items.length === 0 ? (
        <div className="card-plain" style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ margin: 0, color: 'var(--ink-muted)' }}>
            אין כתבות להצגה כרגע. הוסיפו מקורות ונושאים ב
            <Link href="/settings">הגדרות</Link>.
          </p>
        </div>
      ) : (
        <div className="feed-layout" data-has-featured={Boolean(featured)}>
          {featured && <FeaturedCard item={featured} />}

          <section className="feed-main" aria-label="כתבות מאתרי חדשות">
            {restWebsite.length === 0 && !featured ? (
              <div className="card-plain" style={{ padding: 24, textAlign: 'center' }}>
                <p style={{ margin: 0, color: 'var(--ink-muted)' }}>
                  אין כתבות מאתרי חדשות תואמות לסינון הנוכחי.
                </p>
              </div>
            ) : (
              <div className="feed-grid">
                {restWebsite.map((item, i) => (
                  <FeedCard key={item.id} item={item} delay={i} />
                ))}
              </div>
            )}
          </section>

          <aside className="tg-rail">
            <div className="tg-rail-title">
              <TelegramIcon size={16} color="var(--violet)" />
              <span>עדכוני טלגרם</span>
              <span className="pulse-dot pulse-dot-sm" />
            </div>
            {telegramItems.length === 0 ? (
              <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-muted)' }}>
                אין עדכוני טלגרם כרגע.
              </p>
            ) : (
              <div className="tg-list">
                {telegramItems.map((item) => (
                  <TelegramCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}

function FeaturedCard({ item }: { item: FeedItem }) {
  const topic = item.topics[0];
  const live = isLive(item.published_at);
  return (
    <Link href={`/article/${item.id}`} className="card-link featured-link">
      <article className="feed-featured card-in">
        <div className="featured-meta">
          {live && (
            <span className="tag-live">
              <span className="pulse-dot" style={{ width: 7, height: 7 }} />
              מתעדכן עכשיו
            </span>
          )}
          <span style={{ fontSize: 13, color: 'var(--ink-muted)' }}>
            {item.source_name}
            {item.published_at && ` · ${relativeTime(item.published_at)}`}
          </span>
        </div>
        <h1>{item.title}</h1>
        {item.description && <p className="featured-excerpt">{truncate(item.description, 260)}</p>}
        {topic && <span className="tag tag-topic">{topic.name}</span>}
      </article>
    </Link>
  );
}

function FeedCard({ item, delay }: { item: FeedItem; delay: number }) {
  const topic = item.topics[0];
  const live = isLive(item.published_at);
  return (
    <Link href={`/article/${item.id}`} className="card-link">
      <article
        className="feed-card card-in"
        style={{ animationDelay: `${delay * 0.05}s` }}
      >
        <div className="card-meta">
          <GlobeIcon />
          <span>
            {item.source_name}
            {item.published_at && ` · ${relativeTime(item.published_at)}`}
          </span>
          {live && <span className="pulse-dot pulse-dot-sm" />}
        </div>
        <h3>{item.title}</h3>
        {topic && (
          <div>
            <span className="tag tag-topic tag-topic-sm">{topic.name}</span>
          </div>
        )}
        {item.description && <p>{truncate(item.description, 220)}</p>}
      </article>
    </Link>
  );
}

function TelegramCard({ item }: { item: FeedItem }) {
  const live = isLive(item.published_at);
  return (
    <Link href={`/article/${item.id}`} className="card-link tg-card-link">
      <article className="tg-card">
        <div className="card-meta">
          <span>
            {item.source_name}
            {item.published_at && ` · ${relativeTime(item.published_at)}`}
          </span>
          {live && <span className="pulse-dot pulse-dot-xs" />}
        </div>
        <h4>{item.title}</h4>
        {item.description && <p>{truncate(item.description, 140)}</p>}
      </article>
    </Link>
  );
}
