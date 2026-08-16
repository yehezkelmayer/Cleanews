import { createHash } from 'node:crypto';

export function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

export function normalizeTitle(input: string): string {
  return (input || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function contentHash(text: string): string | null {
  const normalized = (text || '').replace(/\s+/g, ' ').trim();
  if (normalized.length < 40) return null;
  return sha256(normalized.slice(0, 4000));
}
