import type { MetadataRoute } from 'next';

/**
 * Web app manifest — served at /manifest.webmanifest by Next.js.
 * Makes the site installable as a PWA from Chrome (Android) / Safari
 * (iOS via Add to Home Screen).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cleanews — קורא חדשות טקסטואלי',
    short_name: 'Cleanews',
    description: 'קורא חדשות אישי בטקסט בלבד — בלי תמונות, בלי פרסומות.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#faf9fd',
    theme_color: '#7c3aed',
    lang: 'he',
    dir: 'rtl',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
