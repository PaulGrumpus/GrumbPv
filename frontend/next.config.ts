import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'knownothing0.xyz',
        pathname: '/backend/uploads/images/**', // or '/uploads/images/**' depending on your proxy
      },
    ],
    // or simpler for a single host:
    // domains: ['knownothing0.xyz'],
  },
};

export default nextConfig;
