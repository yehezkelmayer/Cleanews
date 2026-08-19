'use client';

import { useEffect, useState } from 'react';

export function Toast({ message, ttlMs = 4000 }: { message: string; ttlMs?: number }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), ttlMs);
    return () => clearTimeout(t);
  }, [ttlMs]);
  if (!visible) return null;
  return <div className="toast" role="status">{message}</div>;
}
