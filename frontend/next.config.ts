import type { NextConfig } from "next";

const shouldDisableImageOptimization =
  process.env.NEXT_IMAGE_UNOPTIMIZED === "true";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dev.grumbuild.com',
        pathname: '/backend/uploads/images/**',
      },
    ],
    // Avoid optimizer TLS/cert issues in local dev for remote assets.
    unoptimized:
      process.env.NODE_ENV === "development" || shouldDisableImageOptimization,
    // or simpler for a single host:
    // domains: ['knownothing0.xyz'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
