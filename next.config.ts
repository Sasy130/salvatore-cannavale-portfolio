import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  turbopack: { root: process.cwd() },
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/", destination: "/one-man/index.html" },
      ],
    };
  },
};

export default nextConfig;
