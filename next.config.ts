import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['dockerode'],
  // Disable tracing to avoid warnings about local filesystem operations
  outputFileTracing: false,
};

export default nextConfig;
