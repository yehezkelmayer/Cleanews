import { describe, it, expect } from 'vitest';
import { extractFromHtml } from '../src/lib/extract';

const SAMPLE = `<!doctype html>
<html><head>
  <title>Article Title</title>
  <link rel="canonical" href="https://example.com/canonical">
</head>
<body>
  <header>site nav</header>
  <article>
    <h1>Article Title</h1>
    <p>This is the first paragraph of the article body. It contains enough
       text to make Readability confident about picking this container.</p>
    <img src="hero.jpg">
    <p>A second paragraph with additional content and enough words so that
       the extractor considers the article well-formed and non-trivial.</p>
    <iframe src="https://www.youtube.com/embed/x"></iframe>
    <p>Final paragraph. <a href="https://ref.example">reference</a></p>
  </article>
  <footer>site footer</footer>
</body></html>`;

describe('extractFromHtml', () => {
  it('extracts clean article content with no images or iframes', () => {
    const res = extractFromHtml(SAMPLE, 'https://example.com/x');
    expect(res).not.toBeNull();
    expect(res!.canonicalUrl).toBe('https://example.com/canonical');
    expect(res!.cleanHtml).not.toMatch(/<img/i);
    expect(res!.cleanHtml).not.toMatch(/<iframe/i);
    expect(res!.cleanHtml).not.toMatch(/<picture/i);
    expect(res!.cleanHtml).not.toMatch(/<video/i);
    expect(res!.cleanHtml).toMatch(/first paragraph/);
    expect(res!.cleanText).toMatch(/first paragraph/);
  });
});
