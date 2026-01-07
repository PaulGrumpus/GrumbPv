import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'grumbuild.com',
        pathname: '/backend/uploads/images/**',
      },
    ],
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
