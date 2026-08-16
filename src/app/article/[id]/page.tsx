import Link from 'next/link';
import { notFound } from 'next/navigation';
import { repo } from '@/lib/repo';
import { sanitizeArticleHtml } from '@/lib/sanitize';
import { relativeTime } from '@/lib/format';
import { GlobeIcon, TelegramIcon, isTelegramSource } from '@/app/icons';

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

  const html = sanitizeArticleHtml(article.clean_html ?? '');
  const telegram = isTelegramSource(article.url);

  return (
    <main className="shell-reader reader">
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <Link href="/" style={{ fontSize: 14, textDecoration: 'none' }}>
          → חזרה לפיד
        </Link>
      </div>

      <div
        className="card-meta"
        style={{ fontSize: 13, marginBottom: 'var(--space-2)' }}
      >
        {telegram ? <TelegramIcon /> : <GlobeIcon />}
        <span>
          {article.source_name}
          {article.published_at && ` · ${relativeTime(article.published_at)}`}
        </span>
      </div>

      <h1 style={{ fontSize: 36, lineHeight: 1.15 }}>{article.title}</h1>

      {telegram && (
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-2)',
            flexWrap: 'wrap',
            margin: 'var(--space-3) 0',
          }}
        >
          <span className="tag tag-outline">טלגרם</span>
        </div>
      )}

      <div className="hr" />

      {html ? (
        <div
          style={{ fontSize: 17, lineHeight: 1.8 }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <p className="text-muted">
          לא הצלחנו לחלץ את גוף הכתבה. אפשר לפתוח את המקור המקורי בכפתור למטה.
        </p>
      )}

      <div className="hr" />

      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer nofollow"
        style={{ fontSize: 14 }}
      >
        פתיחת הכתבה המקורית ↗
      </a>
    </main>
  );
}
