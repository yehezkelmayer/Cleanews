'use client';

import { useTransition } from 'react';

export type SegOption = { value: string; label: string };

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

  return (
    <div className="pill-group" role="radiogroup">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className="pill-btn"
          role="radio"
          aria-checked={value === opt.value}
          data-active={value === opt.value}
          disabled={pending}
          onClick={() => {
            const fd = new FormData();
            fd.set(name, opt.value);
            if (extra) for (const [k, v] of Object.entries(extra)) fd.set(k, v);
            startTransition(() => action(fd));
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
