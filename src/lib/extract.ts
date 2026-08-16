import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { sanitizeArticleHtml, htmlToPlainText } from './sanitize';

export type ExtractResult = {
  title: string;
  cleanHtml: string;
  cleanText: string;
  canonicalUrl: string | null;
};

export async function fetchHtml(url: string, timeoutMs = 15_000): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; CleanewsBot/1.0; text-only reader)',
        Accept: 'text/html,application/xhtml+xml',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

export function extractFromHtml(html: string, url: string): ExtractResult | null {
  const dom = new JSDOM(html, { url });
  const doc = dom.window.document;

  const canonicalEl = doc.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  const canonicalUrl = canonicalEl?.href?.trim() || null;

  const reader = new Readability(doc);
  const article = reader.parse();
  if (!article) return null;

  const cleanHtml = sanitizeArticleHtml(article.content ?? '');
  const cleanText = (article.textContent ?? htmlToPlainText(cleanHtml)).replace(/\s+/g, ' ').trim();

  return {
    title: (article.title ?? '').trim(),
    cleanHtml,
    cleanText,
    canonicalUrl,
  };
}

export async function extractArticle(url: string): Promise<ExtractResult | null> {
  const html = await fetchHtml(url);
  return extractFromHtml(html, url);
}
