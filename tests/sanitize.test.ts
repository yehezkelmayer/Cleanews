import { describe, it, expect } from 'vitest';
import { sanitizeArticleHtml } from '../src/lib/sanitize';

describe('sanitizeArticleHtml', () => {
  it('strips images, iframes, scripts, and figures', () => {
    const input = `<article>
      <h1>Hello</h1>
      <img src="photo.jpg" alt="x">
      <p>Article text</p>
      <iframe src="https://youtube.com/embed/x"></iframe>
      <script>alert(1)</script>
      <figure><img src="a.jpg"><figcaption>cap</figcaption></figure>
    </article>`;
    const out = sanitizeArticleHtml(input);
    expect(out).toContain('<h1>Hello</h1>');
    expect(out).toContain('<p>Article text</p>');
    expect(out).not.toMatch(/<img/i);
    expect(out).not.toMatch(/<iframe/i);
    expect(out).not.toMatch(/<script/i);
    expect(out).not.toMatch(/<figure/i);
    expect(out).not.toMatch(/<figcaption/i);
  });

  it('removes video, audio, picture, source, svg, canvas, embed, object', () => {
    const input = `
      <p>ok</p>
      <video src="x.mp4"></video>
      <audio src="x.mp3"></audio>
      <picture><source srcset="a"><img src="b"></picture>
      <svg><path/></svg>
      <canvas></canvas>
      <embed src="x"/>
      <object data="x"></object>`;
    const out = sanitizeArticleHtml(input);
    for (const tag of ['video', 'audio', 'picture', 'source', 'svg', 'canvas', 'embed', 'object', 'img']) {
      expect(out.toLowerCase()).not.toContain(`<${tag}`);
    }
    expect(out).toContain('<p>ok</p>');
  });

  it('strips javascript: and other unsafe hrefs from links', () => {
    const input = `<p><a href="javascript:alert(1)" onclick="steal()">bad</a> ` +
                  `<a href="https://example.com">good</a></p>`;
    const out = sanitizeArticleHtml(input);
    expect(out).not.toMatch(/javascript:/i);
    expect(out).not.toMatch(/onclick/i);
    expect(out).toMatch(/href="https:\/\/example\.com"/);
  });

  it('drops event-handler and style attributes', () => {
    const input = `<p onclick="evil()" style="color:red">t</p>`;
    const out = sanitizeArticleHtml(input);
    expect(out).not.toMatch(/onclick/i);
    expect(out).not.toMatch(/style=/i);
    expect(out).toContain('<p>t</p>');
  });

  it('unwraps unknown tags but keeps their text', () => {
    const input = `<div><section><p>keep me</p><span>and me</span></section></div>`;
    const out = sanitizeArticleHtml(input);
    expect(out).toContain('keep me');
    expect(out).toContain('and me');
    expect(out).not.toMatch(/<section/i);
    expect(out).not.toMatch(/<div/i);
    expect(out).not.toMatch(/<span/i);
  });
});
