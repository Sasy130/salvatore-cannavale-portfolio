import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  turbopack: { root: process.cwd() },
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/", destination: "/one-man/index.html" },
      ],
      afterFiles: [
        { source: "/demos/apex-karting", destination: "/demos/apex-karting/index.html" },
        { source: "/demos/apex-karting/:path*", destination: "/demos/apex-karting/:path*/index.html" },
        { source: "/demos/eterna", destination: "/demos/eterna/index.html" },
        { source: "/demos/eterna/:path*", destination: "/demos/eterna/:path*/index.html" },
        { source: "/demos/noir", destination: "/demos/noir/index.html" },
        { source: "/demos/noir/:path*", destination: "/demos/noir/:path*/index.html" },
        { source: "/demos/rent-car-station", destination: "/demos/rent-car-station/index.html" },
        { source: "/demos/rent-car-station/:path*", destination: "/demos/rent-car-station/:path*/index.html" },
        { source: "/demos/aj-rent-car", destination: "/demos/aj-rent-car/index.html" },
        { source: "/demos/aj-rent-car/:path*", destination: "/demos/aj-rent-car/:path*/index.html" },
      ],
    };
  },
};

export default nextConfig;
