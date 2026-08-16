import type { Metadata } from 'next';
import { TopNav } from './TopNav';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cleanews',
  description: 'קורא חדשות בטקסט בלבד',
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
      </body>
    </html>
  );
}
