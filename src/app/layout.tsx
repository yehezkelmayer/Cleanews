import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cleanews',
  description: 'Text-only news reader',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-app">
          <div className="max-w-feed mx-auto px-4 py-4 flex items-baseline justify-between">
            <Link href="/" className="font-sans text-lg font-semibold tracking-tight">
              Cleanews
            </Link>
            <nav className="font-sans text-sm flex gap-4">
              <Link href="/" className="hover:underline">Feed</Link>
              <Link href="/settings" className="hover:underline">Settings</Link>
            </nav>
          </div>
        </header>
        <main className="max-w-feed mx-auto px-4 py-6">{children}</main>
        <footer className="max-w-feed mx-auto px-4 py-8 font-sans text-xs muted">
          Text-only news reader. No images, ever.
        </footer>
      </body>
    </html>
  );
}
