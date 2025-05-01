import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  // Disable static optimization for authentication-dependent routes
  experimental: {
    optimizePackageImports: [],
  },
  // Configure route rendering behavior
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  // Ensure dashboard routes are rendered dynamically
  reactStrictMode: true,
  // Configure server-side rendering for specific paths
  trailingSlash: false,
  // Define environment variables that will be available on the client-side
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://backend:5000',
  }
};

export default nextConfig;
