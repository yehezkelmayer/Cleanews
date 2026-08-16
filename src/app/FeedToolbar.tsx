'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { SearchIcon } from './icons';

type PillOption<T extends string> = { value: T; label: string };

export function FeedToolbar({
  initialSearch,
  sortMode,
  onlyMatchingTopics,
  maxAgeHours,
}: {
  initialSearch: string;
  sortMode: 'newest' | 'relevance';
  onlyMatchingTopics: boolean;
  maxAgeHours: number;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState(initialSearch);

  // URL navigation (including Back/Forward) is authoritative.
  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  // Debounced search: push to URL 300ms after typing stops.
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

  const sortOpts: PillOption<'newest' | 'relevance'>[] = [
    { value: 'newest', label: 'החדש ביותר' },
    { value: 'relevance', label: 'רלוונטיות' },
  ];
  const onlyOpts = [
    { value: 'on', label: 'תואם לנושאים' },
    { value: 'off', label: 'הכל' },
  ];
  const ageOpts = [
    { value: '24', label: '24 שעות' },
    { value: '72', label: '3 ימים' },
    { value: '168', label: '7 ימים' },
  ];

  return (
    <div className="toolbar" aria-busy={pending}>
      <div className="search-wrap">
        <SearchIcon />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="חיפוש כתבות..."
          aria-label="חיפוש כתבות"
          enterKeyHint="search"
          inputMode="search"
          autoComplete="off"
          spellCheck={false}
        />
        {search && (
          <button
            type="button"
            className="search-clear"
            aria-label="ניקוי החיפוש"
            onClick={() => setSearch('')}
          >
            ×
          </button>
        )}
      </div>

      <div className="toolbar-controls">
        <div className="pill-group" role="group" aria-label="מיון">
          {sortOpts.map((o) => (
            <button
              key={o.value}
              type="button"
              className="pill-btn"
              data-active={sortMode === o.value}
              aria-pressed={sortMode === o.value}
              disabled={pending}
              onClick={() => setParam('sort', o.value === 'newest' ? null : o.value)}
            >
              {o.label}
            </button>
          ))}
        </div>

        <div className="pill-group" role="group" aria-label="סינון נושאים">
          {onlyOpts.map((o) => {
            const active = onlyMatchingTopics === (o.value === 'on');
            return (
              <button
                key={o.value}
                type="button"
                className="pill-btn"
                data-active={active}
                aria-pressed={active}
                disabled={pending}
                onClick={() => setParam('only', o.value)}
              >
                {o.label}
              </button>
            );
          })}
        </div>

        <div className="pill-group" role="group" aria-label="טווח זמן">
          {ageOpts.map((o) => (
            <button
              key={o.value}
              type="button"
              className="pill-btn"
              data-active={String(maxAgeHours) === o.value}
              aria-pressed={String(maxAgeHours) === o.value}
              disabled={pending}
              onClick={() => setParam('age', o.value)}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
