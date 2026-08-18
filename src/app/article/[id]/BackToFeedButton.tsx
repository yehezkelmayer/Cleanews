'use client';

import { useRouter } from 'next/navigation';

/**
 * Real browser-back navigation so the feed restores its previous
 * scroll position. Falls back to router.push('/') if the user
 * landed directly on the article (no history entry to go back to).
 */
export function BackToFeedButton() {
  const router = useRouter();

  function goBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  }

  return (
    <button type="button" onClick={goBack} className="back-btn" aria-label="חזרה לפיד">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="9 6 15 12 9 18" />
      </svg>
      <span>חזרה לפיד</span>
    </button>
  );
}
