import { JSDOM } from 'jsdom';

const ALLOWED_TAGS = new Set([
  'p', 'h1', 'h2', 'h3', 'h4',
  'ul', 'ol', 'li',
  'blockquote', 'strong', 'em', 'a', 'br',
]);

const STRIP_TAGS = new Set([
  'img', 'picture', 'source', 'video', 'audio', 'iframe',
  'svg', 'canvas', 'figure', 'figcaption', 'embed', 'object',
  'script', 'style', 'noscript', 'link', 'meta',
  'header', 'footer', 'nav', 'aside', 'form',
]);

function isSafeHref(href: string): boolean {
  const trimmed = href.trim();
  if (!trimmed) return false;
  if (/^\s*javascript:/i.test(trimmed)) return false;
  if (/^\s*data:/i.test(trimmed)) return false;
  if (/^\s*vbscript:/i.test(trimmed)) return false;
  return true;
}

/**
 * Sanitize article HTML to a strict allowlist. All media tags are removed
 * and every attribute other than `href` on links is stripped.
 */
export function sanitizeArticleHtml(html: string): string {
  if (!html) return '';
  const dom = new JSDOM(`<!doctype html><body><div id="__root__">${html}</div></body>`);
  const root = dom.window.document.getElementById('__root__');
  if (!root) return '';

  // Remove disallowed tags entirely (including their subtree).
  for (const tag of STRIP_TAGS) {
    root.querySelectorAll(tag).forEach((el) => el.remove());
  }

  // Unwrap unknown tags: replace with their text content.
  const walker = dom.window.document.createTreeWalker(root, 1 /* NodeFilter.SHOW_ELEMENT */);
  const toUnwrap: Element[] = [];
  let node = walker.nextNode() as Element | null;
  while (node) {
    const tag = node.tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) toUnwrap.push(node);
    node = walker.nextNode() as Element | null;
  }
  for (const el of toUnwrap) {
    const parent = el.parentNode;
    if (!parent) continue;
    while (el.firstChild) parent.insertBefore(el.firstChild, el);
    parent.removeChild(el);
  }

  // Strip attributes and validate href.
  root.querySelectorAll('*').forEach((el) => {
    const attrs = Array.from(el.attributes);
    for (const attr of attrs) {
      const name = attr.name.toLowerCase();
      if (el.tagName.toLowerCase() === 'a' && name === 'href') {
        if (!isSafeHref(attr.value)) {
          el.removeAttribute(attr.name);
        } else {
          el.setAttribute('href', attr.value.trim());
          el.setAttribute('rel', 'noopener noreferrer nofollow');
          el.setAttribute('target', '_blank');
        }
        continue;
      }
      el.removeAttribute(attr.name);
    }
  });

  // Collapse empty paragraphs.
  root.querySelectorAll('p').forEach((p) => {
    if (!p.textContent || !p.textContent.trim()) p.remove();
  });

  return root.innerHTML.trim();
}

export function htmlToPlainText(html: string): string {
  const dom = new JSDOM(`<!doctype html><body>${html}</body>`);
  return (dom.window.document.body.textContent ?? '').replace(/\s+/g, ' ').trim();
}
