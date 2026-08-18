import { notFound } from 'next/navigation';
import { repo } from '@/lib/repo';
import { sanitizeArticleHtml } from '@/lib/sanitize';
import { relativeTime } from '@/lib/format';
import { GlobeIcon, TelegramIcon, isTelegramSource } from '@/app/icons';
import { BackToFeedButton } from './BackToFeedButton';

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
      <BackToFeedButton />

      <div className="reader-meta">
        {telegram ? <TelegramIcon size={14} color="var(--violet)" /> : <GlobeIcon size={14} />}
        <span>
          {article.source_name}
          {article.published_at && ` · ${relativeTime(article.published_at)}`}
        </span>
      </div>

      <h1>{article.title}</h1>

      {telegram && (
        <div className="reader-tags">
          <span className="tag tag-topic">טלגרם</span>
        </div>
      )}

      <div className="reader-divider" />

      {html ? (
        <div className="reader-body" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <p style={{ color: 'var(--ink-muted)' }}>
          לא הצלחנו לחלץ את גוף הכתבה. אפשר לפתוח את המקור המקורי בקישור למטה.
        </p>
      )}

      <div className="reader-divider-plain" />

      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer nofollow"
        style={{ fontSize: 14, color: 'var(--violet)' }}
      >
        פתיחת הכתבה המקורית ↗
      </a>
    </main>
  );
}
