import type { NextConfig } from "next";

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  webpack: (config) => {
    // ... preexisting webpack config if any
    return config;
  },
  // Ensure we don't depend on native deps that might break in Alpine
  experimental: {
    // serverComponentsExternalPackages: ['better-sqlite3'], // If using better-sqlite3
  }
};

export default withPWA(nextConfig);
