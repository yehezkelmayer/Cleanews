'use client';

import { useActionState } from 'react';
import { runIngestionNowAction, type IngestActionState } from './actions';

const initialState: IngestActionState = { status: 'idle' };

export function RunIngestionButton() {
  const [state, formAction, isPending] = useActionState(runIngestionNowAction, initialState);

  return (
    <div className="card-plain" style={{ display: 'grid', gap: 14 }}>
      <form
        action={formAction}
        style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}
      >
        <button type="submit" disabled={isPending} className="btn btn-primary">
          {isPending ? 'מושך…' : 'משיכת חדשות עכשיו'}
        </button>
        <span style={{ fontSize: 13, color: 'var(--ink-muted)' }}>
          מריץ ingestion על כל המקורות המופעלים. עד ~2 דקות בפעם הראשונה.
        </span>
      </form>

      {state.status === 'ok' && state.summary && (
        <div
          style={{
            fontSize: 13,
            fontFamily: 'ui-monospace, Menlo, monospace',
            borderTop: '1px solid var(--border)',
            paddingTop: 14,
            display: 'grid',
            gap: 4,
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
        <div
          style={{
            fontSize: 13,
            fontFamily: 'ui-monospace, Menlo, monospace',
            borderTop: '1px solid var(--border)',
            paddingTop: 14,
          }}
        >
          <span style={{ color: 'var(--ink-muted)' }}>נכשל:</span> {state.message}
        </div>
      )}
    </div>
  );
}
