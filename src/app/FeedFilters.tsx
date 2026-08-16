'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

type Option = { id: number; name: string };

export function FeedFilters({
  sources,
  topics,
  sourceId,
  topicId,
  sortMode,
}: {
  sources: Option[];
  topics: Option[];
  sourceId: number | null;
  topicId: number | null;
  sortMode: 'newest' | 'relevance';
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params?.toString() ?? '');
    if (value) next.set(key, value);
    else next.delete(key);
    startTransition(() => {
      router.replace(next.toString() ? `/?${next.toString()}` : '/');
      router.refresh();
    });
  }

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--space-3)',
        marginBottom: 'var(--space-4)',
      }}
    >
      <div className="field" style={{ minWidth: 180 }}>
        <label>מקור</label>
        <select
          className="input"
          value={sourceId ?? ''}
          disabled={pending}
          onChange={(e) => update('source', e.target.value)}
        >
          <option value="">כל המקורות</option>
          {sources.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="field" style={{ minWidth: 180 }}>
        <label>נושא</label>
        <select
          className="input"
          value={topicId ?? ''}
          disabled={pending}
          onChange={(e) => update('topic', e.target.value)}
        >
          <option value="">כל הנושאים</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div className="field" style={{ minWidth: 180 }}>
        <label>מיון</label>
        <select
          className="input"
          value={sortMode}
          disabled={pending}
          onChange={(e) => update('sort', e.target.value === 'newest' ? '' : e.target.value)}
        >
          <option value="newest">החדש ביותר</option>
          <option value="relevance">רלוונטיות</option>
        </select>
      </div>

      {(sourceId || topicId || sortMode === 'relevance') && (
        <div className="field" style={{ minWidth: 100, alignSelf: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-ghost"
            disabled={pending}
            onClick={() =>
              startTransition(() => {
                router.replace('/');
                router.refresh();
              })
            }
          >
            נקה סינון
          </button>
        </div>
      )}
    </div>
  );
}
