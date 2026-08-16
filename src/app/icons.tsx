export function LogoMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" aria-hidden="true">
      <rect width="26" height="26" fill="var(--color-accent)" />
      <rect x="5" y="7" width="16" height="2.4" fill="var(--color-bg)" />
      <rect x="5" y="12" width="12" height="2.4" fill="var(--color-bg)" />
      <rect x="5" y="17" width="8" height="2.4" fill="var(--color-bg)" />
    </svg>
  );
}

const strokeProps = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function TelegramIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...strokeProps} aria-hidden="true">
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4 20-7Z" />
    </svg>
  );
}

export function GlobeIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...strokeProps} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Z" />
    </svg>
  );
}

export function isTelegramSource(rssUrl: string | null | undefined): boolean {
  if (!rssUrl) return false;
  return /^https?:\/\/(t\.me|rsshub\.app\/telegram)/i.test(rssUrl);
}
