'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { SearchIcon } from './icons';

type Option = { id: number; name: string };

export function FeedToolbar({
  initialSearch,
  sortMode,
  onlyMatchingTopics,
  maxAgeHours,
  sources,
  topics,
  sourceId,
  topicId,
}: {
  initialSearch: string;
  sortMode: 'newest' | 'relevance';
  onlyMatchingTopics: boolean;
  maxAgeHours: number;
  sources: Option[];
  topics: Option[];
  sourceId: number | null;
  topicId: number | null;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState(initialSearch);

  useEffect(() => {
    const handle = setTimeout(() => {
      if ((initialSearch ?? '') === search) return;
      const next = new URLSearchParams(params?.toString() ?? '');
      if (search.trim()) next.set('q', search.trim());
      else next.delete('q');
      startTransition(() => {
        router.replace(next.toString() ? `/?${next.toString()}` : '/');
      });
    }, 300);
    return () => clearTimeout(handle);
  }, [search, initialSearch, params, router]);

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params?.toString() ?? '');
    if (value === null || value === '') next.delete(key);
    else next.set(key, value);
    startTransition(() => {
      router.replace(next.toString() ? `/?${next.toString()}` : '/');
    });
  }

  const hasSecondaryFilter =
    sourceId !== null || topicId !== null || onlyMatchingTopics;

  return (
    <div className="toolbar" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      {/* Row 1: search + primary filters */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div className="search-wrap">
          <SearchIcon />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש כתבות..."
            disabled={pending}
          />
        </div>

        <div className="pill-group" role="group" aria-label="מיון">
          <button
            type="button"
            className="pill-btn"
            data-active={sortMode === 'newest'}
            disabled={pending}
            onClick={() => setParam('sort', null)}
          >
            החדש ביותר
          </button>
          <button
            type="button"
            className="pill-btn"
            data-active={sortMode === 'relevance'}
            disabled={pending}
            onClick={() => setParam('sort', 'relevance')}
          >
            רלוונטיות
          </button>
        </div>

        <div className="pill-group" role="group" aria-label="נושאים תואמים">
          <button
            type="button"
            className="pill-btn"
            data-active={onlyMatchingTopics}
            disabled={pending}
            onClick={() => setParam('only', 'on')}
          >
            תואם לנושאים
          </button>
          <button
            type="button"
            className="pill-btn"
            data-active={!onlyMatchingTopics}
            disabled={pending}
            onClick={() => setParam('only', 'off')}
          >
            הכל
          </button>
        </div>

        <div className="pill-group" role="group" aria-label="גיל">
          <button
            type="button"
            className="pill-btn"
            data-active={maxAgeHours === 24}
            disabled={pending}
            onClick={() => setParam('age', '24')}
          >
            24 שעות
          </button>
          <button
            type="button"
            className="pill-btn"
            data-active={maxAgeHours === 72}
            disabled={pending}
            onClick={() => setParam('age', '72')}
          >
            3 ימים
          </button>
          <button
            type="button"
            className="pill-btn"
            data-active={maxAgeHours === 168}
            disabled={pending}
            onClick={() => setParam('age', '168')}
          >
            7 ימים
          </button>
        </div>
      </div>

      {/* Row 2: dropdown filters (source, topic) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          paddingTop: 4,
        }}
      >
        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            color: 'var(--ink-muted)',
          }}
        >
          מקור
          <div className="select-wrap" style={{ minWidth: 180 }}>
            <select
              className="input"
              value={sourceId ?? ''}
              disabled={pending}
              onChange={(e) => setParam('source', e.target.value || null)}
            >
              <option value="">כל המקורות</option>
              {sources.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </label>

        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            color: 'var(--ink-muted)',
          }}
        >
          נושא
          <div className="select-wrap" style={{ minWidth: 180 }}>
            <select
              className="input"
              value={topicId ?? ''}
              disabled={pending}
              onChange={(e) => setParam('topic', e.target.value || null)}
            >
              <option value="">כל הנושאים</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </label>

        {hasSecondaryFilter && (
          <button
            type="button"
            className="btn-danger-ghost"
            style={{ color: 'var(--violet)' }}
            disabled={pending}
            onClick={() => {
              const next = new URLSearchParams(params?.toString() ?? '');
              next.delete('source');
              next.delete('topic');
              next.delete('only');
              startTransition(() => {
                router.replace(next.toString() ? `/?${next.toString()}` : '/');
              });
            }}
          >
            נקה סינון
          </button>
        )}
      </div>
    </div>
  );
}
