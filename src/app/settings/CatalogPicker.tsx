'use client';

import { useState } from 'react';
import type { SourcePreset } from '@/lib/presets';
import { addSourcePresetsAction } from './actions';

type Group = SourcePreset['group'];

const GROUP_LABELS: Record<Group, string> = {
  'israel-hebrew': 'ישראל · עברית',
  'israel-english': 'Israel · English',
  'world-news': 'World news',
  tech: 'Tech',
};

export function CatalogPicker({ presets }: { presets: SourcePreset[] }) {
  const [group, setGroup] = useState<Group>('israel-hebrew');
  const items = presets.filter((p) => p.group === group);

  return (
    <form action={addSourcePresetsAction} style={{ display: 'grid', gap: 'var(--space-3)' }}>
      <div className="field">
        <label>קטגוריה</label>
        <select
          className="input"
          value={group}
          onChange={(e) => setGroup(e.target.value as Group)}
        >
          {Object.entries(GROUP_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {items.length === 0 ? (
        <div className="text-muted" style={{ fontSize: 13 }}>
          כל המקורות בקטגוריה זו כבר נוספו.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--space-1) var(--space-4)',
          }}
        >
          {items.map((preset) => (
            <label
              key={preset.rss_url}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-2)',
                fontSize: 13,
              }}
            >
              <input
                type="checkbox"
                name="preset_rss"
                value={preset.rss_url}
                style={{ marginTop: 3 }}
              />
              <span>
                <strong>{preset.name}</strong>{' '}
                <span className="text-muted">
                  — {new URL(preset.website_url).hostname}
                </span>
              </span>
            </label>
          ))}
        </div>
      )}

      <div>
        <button type="submit" className="btn btn-primary">
          הוספת המקורות המסומנים
        </button>
      </div>
    </form>
  );
}
