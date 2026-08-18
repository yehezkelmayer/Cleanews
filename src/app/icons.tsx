export function LogoMark({ size = 26 }: { size?: number }) {
  // Rounded-square badge with three "text line" bars — blue, ink, amber.
  // This is the brand mark's own palette (blue/ink/amber), intentionally
  // independent of the app's violet/coral UI accent — like a flag.
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      role="img"
      aria-label="Cleanews"
    >
      <rect
        x="6"
        y="6"
        width="60"
        height="60"
        rx="16"
        fill="#ffffff"
        stroke="rgba(30,27,46,0.10)"
        strokeWidth="1.5"
      />
      <rect x="18" y="24" width="36" height="5" rx="2.5" fill="#2563eb" />
      <rect x="18" y="34" width="36" height="5" rx="2.5" fill="#1e1b2e" />
      <rect x="18" y="44" width="20" height="5" rx="2.5" fill="#d97706" />
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

export function TelegramIcon({
  size = 13,
  color,
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      {...strokeProps}
      style={color ? { color } : undefined}
      aria-hidden="true"
    >
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

export function SearchIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...strokeProps} aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function isTelegramSource(rssUrl: string | null | undefined): boolean {
  if (!rssUrl) return false;
  return /^https?:\/\/(t\.me|rsshub\.app\/telegram)/i.test(rssUrl);
}
