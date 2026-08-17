'use client';

import { useState } from 'react';
import type { SourcePreset } from '@/lib/presets';
import { addSourcePresetsAction } from './actions';

type Group = SourcePreset['group'];

const GROUP_LABELS: Record<Group, string> = {
  'israel-hebrew': 'ישראל · עברית',
  'israel-english': 'Israel · English',
  telegram: 'Telegram · ישראל',
  'world-news': 'World news',
  tech: 'Tech',
};

function presetDetail(preset: SourcePreset): string {
  const url = new URL(preset.website_url);
  if (preset.group === 'telegram') {
    const handle = url.pathname.split('/').filter(Boolean)[0];
    return handle ? `@${handle}` : 'Telegram';
  }
  return url.hostname;
}

export function CatalogPicker({ presets }: { presets: SourcePreset[] }) {
  const [group, setGroup] = useState<Group>('israel-hebrew');
  const items = presets.filter((p) => p.group === group);

  return (
    <form action={addSourcePresetsAction} className="stack-form">
      <div className="field">
        <label htmlFor="source-catalog-group">קטגוריה</label>
        <div className="select-wrap">
          <select
            id="source-catalog-group"
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
      </div>

      {items.length === 0 ? (
        <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-muted)' }}>
          כל המקורות בקטגוריה זו כבר נוספו.
        </p>
      ) : (
        <div className="choice-grid">
          {items.map((preset) => (
            <label key={preset.rss_url} className="choice-row">
              <input
                type="checkbox"
                name="preset_rss"
                value={preset.rss_url}
              />
              <span>
                <strong style={{ color: 'var(--ink)' }}>{preset.name}</strong>{' '}
                <span style={{ color: 'var(--ink-muted)' }}>
                  — {presetDetail(preset)}
                </span>
              </span>
            </label>
          ))}
        </div>
      )}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          הוספת המקורות המסומנים
        </button>
      </div>
    </form>
  );
}
