import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { TopNav } from './TopNav';
import { BottomNav } from './BottomNav';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cleanews',
  description: 'קורא חדשות בטקסט בלבד',
  applicationName: 'Cleanews',
  appleWebApp: {
    capable: true,
    title: 'Cleanews',
    statusBarStyle: 'default',
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf9fd' },
    { media: '(prefers-color-scheme: dark)', color: '#faf9fd' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body>
        <TopNav />
        {children}
        <footer className="footer-mini">
          קורא חדשות בטקסט בלבד. ללא תמונות, אף פעם.
        </footer>
        <BottomNav />
        <Analytics />
      </body>
    </html>
  );
}
