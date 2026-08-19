'use client';

import { useMemo, useState } from 'react';
import type { SourcePreset } from '@/lib/presets';
import { SOURCE_GROUP_LABELS } from '@/lib/presets';

type Group = SourcePreset['group'];

export function OnboardingCatalogPicker({ presets }: { presets: SourcePreset[] }) {
  const [group, setGroup] = useState<Group>('israel-hebrew');
  const items = useMemo(() => presets.filter((p) => p.group === group), [group, presets]);

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div className="field">
        <label>קטגוריה</label>
        <div className="select-wrap">
          <select
            className="input"
            value={group}
            onChange={(e) => setGroup(e.target.value as Group)}
          >
            {(Object.entries(SOURCE_GROUP_LABELS) as [Group, string][]).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {items.length === 0 ? (
        <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-muted)' }}>
          אין מקורות בקטגוריה זו כרגע.
        </p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '8px 20px',
            maxHeight: '48vh',
            overflowY: 'auto',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 12,
            background: 'var(--surface-soft)',
          }}
        >
          {items.map((preset) => (
            <label
              key={preset.rss_url}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                fontSize: 14,
                color: 'var(--ink-body-soft)',
                padding: '4px 2px',
              }}
            >
              <input
                type="checkbox"
                name="preset_rss"
                value={preset.rss_url}
                style={{ marginTop: 3, accentColor: 'var(--violet)' }}
              />
              <span>
                <strong style={{ color: 'var(--ink)' }}>{preset.name}</strong>
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
