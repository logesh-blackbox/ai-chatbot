import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    ppr: true,
  },
  async rewrites() {
    return [];
  },
  webSocketTimeout: 30000,
  server: {
    hostname: '0.0.0.0',
    port: 3000
  },
  images: {
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh',
      },
    ],
  },
};

export default nextConfig;
