import type { NextConfig } from 'next';

const repo = 'dilware-tool-webAhora';
const assetPrefix = `/${repo}/`;
const basePath = `/${repo}`;

const nextConfig: NextConfig = {
  /* config options here */
  // Only use static export for production builds, not for development
  ...(process.env.NODE_ENV === 'production'
    ? {
        output: 'export',
        assetPrefix: assetPrefix,
        basePath: basePath,
      }
    : {}),
  experimental: {
    optimizePackageImports: [],
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
