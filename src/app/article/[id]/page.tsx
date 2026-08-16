import Link from 'next/link';
import { notFound } from 'next/navigation';
import { repo } from '@/lib/repo';
import { sanitizeArticleHtml } from '@/lib/sanitize';
import { relativeTime } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = parseInt(id, 10);
  if (!Number.isFinite(numId)) notFound();
  const article = await repo.getArticle(numId);
  if (!article) notFound();

  // Sanitize again at render time — defence in depth: even a corrupted DB row
  // cannot inject <img>, <script>, or any disallowed markup.
  const html = sanitizeArticleHtml(article.clean_html ?? '');

  return (
    <article className="reader max-w-reader mx-auto">
      <div className="font-sans text-xs muted mb-2">
        <Link href="/" className="hover:underline">← Feed</Link>
      </div>
      <h1 className="text-3xl leading-tight font-semibold">{article.title}</h1>
      <div className="font-sans text-xs muted mt-2">
        {article.source_name}
        {article.published_at && (
          <>
            {' · '}
            <time dateTime={article.published_at}>{relativeTime(article.published_at)}</time>
          </>
        )}
      </div>

      {html ? (
        <div
          className="mt-6"
          // Content is server-sanitized against a strict allowlist. All media
          // tags are stripped; only p/h*/ul/ol/li/blockquote/strong/em/a/br remain.
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <p className="mt-6 muted text-sm">
          The article body could not be extracted. Open the original for the full text.
        </p>
      )}

      <div className="mt-10 font-sans text-sm border-t border-app pt-4">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="underline"
        >
          Open original article ↗
        </a>
      </div>
    </article>
  );
}
