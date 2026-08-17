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
  telegram: 'טלגרם',
};

export function CatalogPicker({ presets }: { presets: SourcePreset[] }) {
  const [group, setGroup] = useState<Group>('israel-hebrew');
  const items = presets.filter((p) => p.group === group);

  return (
    <form action={addSourcePresetsAction} style={{ display: 'grid', gap: 14 }}>
      <div className="field">
        <label>קטגוריה</label>
        <div className="select-wrap">
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
      </div>

      {items.length === 0 ? (
        <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-muted)' }}>
          כל המקורות בקטגוריה זו כבר נוספו.
        </p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '6px 20px',
          }}
        >
          {items.map((preset) => (
            <label
              key={preset.rss_url}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                fontSize: 13,
                color: 'var(--ink-body-soft)',
              }}
            >
              <input
                type="checkbox"
                name="preset_rss"
                value={preset.rss_url}
                style={{ marginTop: 3, accentColor: 'var(--violet)' }}
              />
              <span>
                <strong style={{ color: 'var(--ink)' }}>{preset.name}</strong>{' '}
                <span style={{ color: 'var(--ink-muted)' }}>
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
