'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoMark } from './icons';

export function TopNav() {
  const pathname = usePathname() ?? '/';
  const isFeed = pathname === '/' || pathname.startsWith('/article');
  const isSettings = pathname.startsWith('/settings');
  return (
    <nav className="nav">
      <div className="nav-links">
        <Link href="/" aria-current={isFeed ? 'page' : undefined}>
          פיד
        </Link>
        <Link href="/settings" aria-current={isSettings ? 'page' : undefined}>
          הגדרות
        </Link>
      </div>
      <span className="nav-brand">
        <LogoMark />
        <span>Cleanews</span>
      </span>
    </nav>
  );
}
