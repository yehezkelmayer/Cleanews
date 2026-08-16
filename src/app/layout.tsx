import type { Metadata, Viewport } from 'next';
import { TopNav } from './TopNav';
import { BottomNav } from './BottomNav';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cleanews',
  description: 'קורא חדשות בטקסט בלבד',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
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
      </body>
    </html>
  );
}
