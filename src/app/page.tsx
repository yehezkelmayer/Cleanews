import Link from 'next/link';
import { repo } from '@/lib/repo';
import { relativeTime, truncate } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function FeedPage() {
  const settings = await repo.getSettings();
  const items = await repo.feed({
    onlyMatchingTopics: settings.only_matching_topics,
    sortMode: settings.sort_mode,
    maxAgeHours: settings.max_article_age_hours,
  });

  return (
    <div className="space-y-8">
      <div className="font-sans flex items-baseline justify-between text-xs muted">
        <span>{items.length} articles</span>
        <span>
          {settings.sort_mode === 'newest' ? 'Newest' : 'Relevance'} · last{' '}
          {settings.max_article_age_hours}h ·{' '}
          {settings.only_matching_topics ? 'topics only' : 'all articles'}
        </span>
      </div>

      {items.length === 0 && (
        <div className="font-sans text-sm muted">
          Nothing yet. Add sources and topics in{' '}
          <Link href="/settings" className="underline">Settings</Link>, then run ingestion.
        </div>
      )}

      <ul className="divide-y divide-app border-t border-b border-app">
        {items.map((item) => (
          <li key={item.id} className="py-5">
            <div className="font-sans text-xs muted mb-1">
              {item.source_name}
              {item.published_at && (
                <>
                  {' · '}
                  <time dateTime={item.published_at}>{relativeTime(item.published_at)}</time>
                </>
              )}
            </div>
            <h2 className="text-xl leading-snug">
              <Link href={`/article/${item.id}`} className="hover:underline">
                {item.title}
              </Link>
            </h2>
            {item.topics.length > 0 && (
              <div className="font-sans text-xs muted mt-1">
                {item.topics.map((t) => t.name).join(' · ')}
              </div>
            )}
            {item.description && (
              <p className="mt-2 text-base leading-relaxed">{truncate(item.description, 280)}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
