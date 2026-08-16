import { describe, it, expect } from 'vitest';
import { parseTelegramHandle } from '../src/lib/telegram';

describe('parseTelegramHandle', () => {
  it('recognizes t.me/s/HANDLE', () => {
    expect(parseTelegramHandle('https://t.me/s/amitsegal')).toBe('amitsegal');
  });
  it('recognizes t.me/HANDLE', () => {
    expect(parseTelegramHandle('https://t.me/AbuAliExpress')).toBe('AbuAliExpress');
  });
  it('recognizes legacy RSSHub URLs so old rows keep working', () => {
    expect(parseTelegramHandle('https://rsshub.app/telegram/channel/yinonmagal')).toBe(
      'yinonmagal',
    );
  });
  it('returns null for non-Telegram URLs', () => {
    expect(parseTelegramHandle('https://www.ynet.co.il/rss.xml')).toBeNull();
    expect(parseTelegramHandle('https://feeds.bbci.co.uk/news/rss.xml')).toBeNull();
  });
});
