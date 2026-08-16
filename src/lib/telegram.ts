import { JSDOM } from 'jsdom';
import { sanitizeArticleHtml } from './sanitize';

/**
 * Telegram ingestion — reads a channel's public web preview at
 * https://t.me/s/<handle> and returns its recent messages.
 *
 * No third-party services (RSSHub / Nitter-style bridges) are involved:
 * the preview page is stable HTML that Telegram itself renders for every
 * public channel.
 */

export type TelegramMessage = {
  title: string;
  link: string;
  publishedAt: string | null;
  description: string;
  cleanHtml: string;
};

/**
 * Recognize the URLs we store for Telegram sources so the ingester can
 * route them to this module instead of the RSS parser.
 */
export function parseTelegramHandle(url: string): string | null {
  const tme = url.match(/^https?:\/\/t\.me\/(?:s\/)?([A-Za-z0-9_]{3,64})\/?$/);
  if (tme) return tme[1];
  const rsshub = url.match(/rsshub\.app\/telegram\/channel\/([A-Za-z0-9_]{3,64})\/?$/);
  if (rsshub) return rsshub[1];
  return null;
}

export async function fetchTelegramChannel(
  handle: string,
  timeoutMs = 15_000,
): Promise<TelegramMessage[]> {
  const url = `https://t.me/s/${handle}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let html: string;
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'en,he;q=0.9',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    html = await res.text();
  } finally {
    clearTimeout(timer);
  }

  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const nodes = doc.querySelectorAll('.tgme_widget_message');
  const messages: TelegramMessage[] = [];

  nodes.forEach((el) => {
    const dataPost = el.getAttribute('data-post') || '';
    const parts = dataPost.split('/');
    const postId = parts[1];
    if (!postId) return;
    const link = `https://t.me/${handle}/${postId}`;

    const textEl = el.querySelector('.tgme_widget_message_text');
    const rawHtml = textEl?.innerHTML ?? '';
    const cleanHtml = sanitizeArticleHtml(rawHtml ? `<p>${rawHtml}</p>` : '');
    const text = (textEl?.textContent ?? '').replace(/\s+\n/g, '\n').trim();
    if (!text && !cleanHtml) return;

    const timeEl = el.querySelector('time[datetime]');
    const publishedAt = timeEl?.getAttribute('datetime') ?? null;

    const firstLine = text.split('\n').find((l) => l.trim().length > 0) ?? text;
    const title =
      firstLine.length > 120 ? firstLine.slice(0, 117).trimEnd() + '…' : firstLine || `@${handle}`;

    messages.push({
      title,
      link,
      publishedAt,
      description: text.slice(0, 600),
      cleanHtml,
    });
  });

  // Telegram lists oldest first; reverse so newest is first.
  return messages.reverse();
}
