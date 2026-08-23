import { ImageResponse } from 'next/og';

// Rendered as /apple-icon by Next — iOS "Add to Home Screen" uses it
// as the launcher tile. 180×180 is Apple's recommended maximum.
export const runtime = 'nodejs';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#ffffff',
          borderRadius: 40,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          padding: 40,
          border: '2px solid rgba(30,27,46,0.10)',
        }}
      >
        <div style={{ width: '76%', height: 16, borderRadius: 8, background: '#2563eb' }} />
        <div style={{ width: '76%', height: 16, borderRadius: 8, background: '#1e1b2e' }} />
        <div style={{ width: '42%', height: 16, borderRadius: 8, background: '#d97706' }} />
      </div>
    ),
    size,
  );
}
