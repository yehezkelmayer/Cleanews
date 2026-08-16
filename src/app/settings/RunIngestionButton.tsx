'use client';

import { useActionState } from 'react';
import { runIngestionNowAction, type IngestActionState } from './actions';

const initialState: IngestActionState = { status: 'idle' };

export function RunIngestionButton() {
  const [state, formAction, isPending] = useActionState(runIngestionNowAction, initialState);

  return (
    <div className="border border-app rounded p-3 space-y-2">
      <form action={formAction} className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 border border-app rounded text-sm font-semibold hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? 'Fetching…' : 'Fetch news now'}
        </button>
        <span className="muted text-xs">
          Runs the ingestion pipeline against all enabled sources. Can take 30–120 seconds
          on the first run.
        </span>
      </form>

      {state.status === 'ok' && state.summary && (
        <div className="text-xs font-mono border-t border-app pt-2 space-y-0.5">
          <div>
            <span className="muted">Sources checked:</span> {state.summary.sourcesChecked}
          </div>
          <div>
            <span className="muted">Articles found:</span> {state.summary.articlesFound}
          </div>
          <div>
            <span className="muted">New articles:</span> {state.summary.newArticles}
          </div>
          <div>
            <span className="muted">Errors:</span> {state.summary.errors}
          </div>
          {state.summary.errorDetails.length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer muted">Show error details</summary>
              <ul className="mt-1 space-y-0.5">
                {state.summary.errorDetails.slice(0, 20).map((e, i) => (
                  <li key={i}>
                    <span className="muted">{e.source}:</span> {e.message}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      {state.status === 'error' && (
        <div className="text-xs font-mono border-t border-app pt-2">
          <span className="muted">Failed:</span> {state.message}
        </div>
      )}
    </div>
  );
}
