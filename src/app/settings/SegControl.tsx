'use client';

import { useId, useTransition } from 'react';

export type SegOption = { value: string; label: string };

/**
 * Modernist segmented control. Renders styled radio inputs; on change,
 * calls the provided action with the chosen value (plus optional extra
 * fields), inside a startTransition so navigation isn't blocked.
 */
export function SegControl({
  name,
  value,
  options,
  action,
  extra,
}: {
  name: string;
  value: string;
  options: SegOption[];
  action: (formData: FormData) => Promise<void>;
  extra?: Record<string, string>;
}) {
  const [pending, startTransition] = useTransition();
  const uid = useId();

  return (
    <div className="seg" role="radiogroup">
      {options.map((opt) => (
        <label key={opt.value} className="seg-opt">
          <input
            type="radio"
            name={`${name}-${uid}`}
            value={opt.value}
            checked={value === opt.value}
            disabled={pending}
            onChange={() => {
              const fd = new FormData();
              fd.set(name, opt.value);
              if (extra) for (const [k, v] of Object.entries(extra)) fd.set(k, v);
              startTransition(() => action(fd));
            }}
          />
          {opt.label}
        </label>
      ))}
    </div>
  );
}
