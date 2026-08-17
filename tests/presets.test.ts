import { describe, expect, it } from 'vitest';
import { SOURCE_PRESETS } from '../src/lib/presets';
import { parseTelegramHandle } from '../src/lib/telegram';

const VERIFIED_RSS_URLS = [
  'https://www.ynet.co.il/Integration/StoryRss2.xml',
  'https://rss.walla.co.il/feed/1?type=main',
  'https://www.globes.co.il/webservice/rss/rssfeeder.asmx/FeederNode?iID=585',
  'https://www.israelhayom.co.il/rss',
  'https://www.srugim.co.il/feed',
  'https://www.kipa.co.il/feed/',
  'https://www.timesofisrael.com/feed/',
  'https://www.jpost.com/rss/rssfeedsfrontpage.aspx',
  'https://feeds.bbci.co.uk/news/rss.xml',
  'https://www.theguardian.com/world/rss',
  'https://feeds.skynews.com/feeds/rss/home.xml',
  'https://www.independent.co.uk/news/world/rss',
  'https://rss.dw.com/rdf/rss-en-all',
  'https://www.euronews.com/rss?level=theme&name=news',
  'https://www.lemonde.fr/rss/une.xml',
  'https://feeds.npr.org/1001/rss.xml',
  'https://www.cbsnews.com/latest/rss/main',
  'https://feeds.nbcnews.com/nbcnews/public/news',
  'https://moxie.foxnews.com/google-publisher/latest.xml',
  'https://www.aljazeera.com/xml/rss/all.xml',
  'https://feeds.arstechnica.com/arstechnica/index',
  'https://techcrunch.com/feed/',
  'https://www.wired.com/feed/rss',
];

const TELEGRAM_HANDLES = [
  'danielamram3',
  'yediotnews25',
  'abualiexpress',
  'amitsegal',
  'ramreports',
  'arabworld301news',
  'yinonews',
  'firstreportsnews',
  'israelhayomofficial',
  'n12chat',
  'iltoday',
  'calcalist',
  'hamoked_il',
  'ariel_kahana',
  'globesnews',
  'newsil360',
  'political_arena',
  'new_security8200',
  'tzap1',
  'ziratwar',
  'n12_news',
  'michaelshemesh',
  'sulianditay',
  'haskupim',
  'now14_israel',
];

describe('source presets', () => {
  it('contains every verified RSS URL from the 2026-08-17 catalog', () => {
    const urls = new Set(SOURCE_PRESETS.map((preset) => preset.rss_url));
    for (const url of VERIFIED_RSS_URLS) expect(urls.has(url), url).toBe(true);
  });

  it('contains the 25 verified Telegram channels exactly once', () => {
    const handles = SOURCE_PRESETS.filter((preset) => preset.group === 'telegram')
      .map((preset) => parseTelegramHandle(preset.rss_url)?.toLowerCase())
      .filter((handle): handle is string => Boolean(handle));

    expect(handles).toHaveLength(25);
    expect(new Set(handles).size).toBe(25);
    expect(handles.sort()).toEqual([...TELEGRAM_HANDLES].sort());
  });

  it('does not offer the explicitly unverified Israeli RSS feeds', () => {
    const israeliRssNames = new Set(
      SOURCE_PRESETS.filter(
        (preset) => preset.group === 'israel-hebrew' || preset.group === 'israel-english',
      ).map((preset) => preset.name),
    );

    for (const name of ['הארץ', 'Haaretz (English)', 'מעריב', 'כלכליסט', 'מאקו (N12)']) {
      expect(israeliRssNames.has(name), name).toBe(false);
    }
  });

  it('uses unique, valid source URLs', () => {
    const urls = SOURCE_PRESETS.map((preset) => preset.rss_url);
    expect(new Set(urls).size).toBe(urls.length);
    for (const preset of SOURCE_PRESETS) {
      expect(() => new URL(preset.website_url), preset.website_url).not.toThrow();
      expect(() => new URL(preset.rss_url), preset.rss_url).not.toThrow();
    }
  });
});
