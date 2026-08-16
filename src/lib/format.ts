export function relativeTime(iso: string | null): string {
  if (!iso) return '';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const diffSec = Math.max(1, Math.round((Date.now() - t) / 1000));
  if (diffSec < 60) return `לפני ${diffSec} שניות`;
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return diffMin === 1 ? 'לפני דקה' : `לפני ${diffMin} דקות`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 48) return diffHr === 1 ? 'לפני שעה' : `לפני ${diffHr} שעות`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 30) return diffDay === 1 ? 'אתמול' : `לפני ${diffDay} ימים`;
  return new Date(iso).toISOString().slice(0, 10);
}

export function truncate(text: string | null | undefined, max = 240): string {
  if (!text) return '';
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1).replace(/\s+\S*$/, '') + '…';
}

export function maxAgeLabel(hours: number): string {
  if (hours <= 24) return 'ב-24 השעות האחרונות';
  if (hours <= 72) return 'ב-3 הימים האחרונים';
  return 'ב-7 הימים האחרונים';
}

export function sortLabel(mode: 'newest' | 'relevance'): string {
  return mode === 'newest' ? 'החדש ביותר' : 'רלוונטיות';
}
