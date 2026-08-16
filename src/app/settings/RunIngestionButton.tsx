'use client';

import { type FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { IngestSummary } from '@/lib/ingest';

type IngestState =
  | { status: 'idle' }
  | { status: 'ok'; summary: IngestSummary }
  | { status: 'error'; message: string };

export function RunIngestionButton() {
  const router = useRouter();
  const [secret, setSecret] = useState('');
  const [state, setState] = useState<IngestState>({ status: 'idle' });
  const [isPending, setIsPending] = useState(false);

  async function runNow(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setState({ status: 'idle' });

    try {
      const response = await fetch('/api/cron/fetch-news', {
        method: 'POST',
        headers: { Authorization: `Bearer ${secret}` },
      });
      const payload = (await response.json().catch(() => null)) as
        | IngestSummary
        | { error?: string }
        | null;

      if (!response.ok) {
        const message =
          response.status === 401
            ? 'הסוד שגוי, או שהמשתנה CRON_SECRET אינו מוגדר.'
            : payload && 'error' in payload && payload.error
              ? payload.error
              : `הבקשה נכשלה (HTTP ${response.status}).`;
        throw new Error(message);
      }

      setState({ status: 'ok', summary: payload as IngestSummary });
      setSecret('');
      router.refresh();
    } catch (error) {
      setState({
        status: 'error',
        message: error instanceof Error ? error.message : 'המשיכה נכשלה.',
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="card-plain ingestion-card">
      <form onSubmit={runNow} className="ingestion-form">
        <label className="field ingestion-secret">
          <span className="field-label">סוד מנהל</span>
          <input
            type="password"
            className="input"
            value={secret}
            onChange={(event) => setSecret(event.target.value)}
            autoComplete="current-password"
            required
            disabled={isPending}
            placeholder="CRON_SECRET"
          />
        </label>
        <button type="submit" disabled={isPending} className="btn btn-primary">
          {isPending ? 'מושך…' : 'משיכת חדשות עכשיו'}
        </button>
        <span className="form-help">
          מריץ ingestion מוגן על כל המקורות המופעלים. הפעולה עשויה להימשך מספר דקות.
        </span>
      </form>

      {state.status === 'ok' && state.summary && (
        <div
          className="ingestion-result"
          role="status"
          aria-live="polite"
          style={{
            fontFamily: 'ui-monospace, Menlo, monospace',
          }}
        >
          <div>
            <span style={{ color: 'var(--ink-muted)' }}>מקורות שנבדקו:</span>{' '}
            {state.summary.sourcesChecked}
          </div>
          <div>
            <span style={{ color: 'var(--ink-muted)' }}>כתבות נמצאו:</span>{' '}
            {state.summary.articlesFound}
          </div>
          <div>
            <span style={{ color: 'var(--ink-muted)' }}>כתבות חדשות:</span>{' '}
            {state.summary.newArticles}
          </div>
          <div>
            <span style={{ color: 'var(--ink-muted)' }}>שגיאות:</span>{' '}
            {state.summary.errors}
          </div>
          {state.summary.errorDetails.length > 0 && (
            <details style={{ marginTop: 8 }}>
              <summary style={{ color: 'var(--ink-muted)', cursor: 'pointer' }}>
                פרטי שגיאה
              </summary>
              <ul style={{ margin: '4px 0 0', paddingInlineStart: 16 }}>
                {state.summary.errorDetails.slice(0, 20).map((e, i) => (
                  <li key={i}>
                    <span style={{ color: 'var(--ink-muted)' }}>{e.source}:</span> {e.message}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      {state.status === 'error' && (
        <div className="ingestion-result" role="alert">
          <span style={{ color: 'var(--ink-muted)' }}>נכשל:</span> {state.message}
        </div>
      )}
    </div>
  );
}
