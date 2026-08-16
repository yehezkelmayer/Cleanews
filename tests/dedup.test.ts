import { describe, it, expect } from 'vitest';
import { contentHash, normalizeTitle } from '../src/lib/hash';

describe('dedup helpers', () => {
  it('produces the same content hash for whitespace-only differences', () => {
    const a = 'The quick brown fox jumps over the lazy dog. '.repeat(5);
    const b = a.replace(/\s+/g, '   ');
    expect(contentHash(a)).toBe(contentHash(b));
  });

  it('produces different hashes for different content', () => {
    const a = 'The quick brown fox jumps over the lazy dog. '.repeat(5);
    const b = 'A completely different article body about weather. '.repeat(5);
    expect(contentHash(a)).not.toBe(contentHash(b));
  });

  it('normalizes titles for loose comparison', () => {
    expect(normalizeTitle('Breaking: The Report!  ')).toBe('breaking the report');
    expect(normalizeTitle('Breaking — The Report')).toBe('breaking the report');
  });

  it('returns null hash for tiny content', () => {
    expect(contentHash('short')).toBeNull();
  });
});
