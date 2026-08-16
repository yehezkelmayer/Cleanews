'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoMark } from './icons';

export function TopNav() {
  const pathname = usePathname() ?? '/';
  const isFeed = pathname === '/' || pathname.startsWith('/article');
  const isSettings = pathname.startsWith('/settings');

  return (
    <nav className="nav" aria-label="ניווט ראשי">
      <div className="nav-links">
        <Link href="/" className="nav-link" aria-current={isFeed ? 'page' : undefined}>
          פיד
        </Link>
        <Link
          href="/settings"
          className="nav-link"
          aria-current={isSettings ? 'page' : undefined}
        >
          הגדרות
        </Link>
      </div>
      <Link href="/" className="nav-brand" aria-label="Cleanews — חזרה לפיד">
        <LogoMark />
        <span className="nav-brand-text">Cleanews</span>
      </Link>
    </nav>
  );
}
