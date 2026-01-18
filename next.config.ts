import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Suppress ESLint during builds for faster deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Suppress TypeScript errors during builds (already validated)
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
