import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ignore TypeScript errors during build if any
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable image optimization for simpler deployment
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
