'use client';

import { useActionState } from 'react';
import { runIngestionNowAction, type IngestActionState } from './actions';

const initialState: IngestActionState = { status: 'idle' };

export function RunIngestionButton() {
  const [state, formAction, isPending] = useActionState(runIngestionNowAction, initialState);

  return (
    <div className="card" style={{ padding: 'var(--space-4)', gap: 'var(--space-3)' }}>
      <form
        action={formAction}
        style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}
      >
        <button type="submit" disabled={isPending} className="btn btn-primary">
          {isPending ? 'מושך…' : 'משיכת חדשות עכשיו'}
        </button>
        <span className="text-muted" style={{ fontSize: 13 }}>
          מריץ ingestion על כל המקורות המופעלים. יכול לקחת 30–120 שניות בפעם הראשונה.
        </span>
      </form>

      {state.status === 'ok' && state.summary && (
        <div
          style={{
            fontSize: 13,
            fontFamily: 'ui-monospace, Menlo, monospace',
            borderTop: '2px solid var(--color-divider)',
            paddingTop: 'var(--space-3)',
            display: 'grid',
            gap: 4,
          }}
        >
          <div>
            <span className="text-muted">מקורות שנבדקו:</span> {state.summary.sourcesChecked}
          </div>
          <div>
            <span className="text-muted">כתבות נמצאו:</span> {state.summary.articlesFound}
          </div>
          <div>
            <span className="text-muted">כתבות חדשות:</span> {state.summary.newArticles}
          </div>
          <div>
            <span className="text-muted">שגיאות:</span> {state.summary.errors}
          </div>
          {state.summary.errorDetails.length > 0 && (
            <details style={{ marginTop: 'var(--space-2)' }}>
              <summary className="text-muted" style={{ cursor: 'pointer' }}>
                פרטי שגיאה
              </summary>
              <ul style={{ margin: '4px 0 0', paddingInlineStart: 'var(--space-4)' }}>
                {state.summary.errorDetails.slice(0, 20).map((e, i) => (
                  <li key={i}>
                    <span className="text-muted">{e.source}:</span> {e.message}
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
            borderTop: '2px solid var(--color-divider)',
            paddingTop: 'var(--space-3)',
          }}
        >
          <span className="text-muted">נכשל:</span> {state.message}
        </div>
      )}
    </div>
  );
}
