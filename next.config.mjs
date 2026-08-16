/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  agentRules: false,
  images: {
    unoptimized: true,
    disableStaticImages: true,
  },
  serverExternalPackages: [
    'jsdom',
    '@mozilla/readability',
    'html-encoding-sniffer',
    'whatwg-encoding',
    'rss-parser',
    'postgres',
  ],
  experimental: {
    serverActions: { bodySizeLimit: '1mb' },
  },
};

export default nextConfig;
