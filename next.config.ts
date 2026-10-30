import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  turbopack: { root: process.cwd() },
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/", destination: "/one-man/index.html" },
        { source: "/proposte", destination: "/one-man/proposte.html" },
      ],
      afterFiles: [
        { source: "/demos/black-label", destination: "/demos/black-label/index.html" },
        { source: "/demos/black-label/:path*", destination: "/demos/black-label/:path*/index.html" },
        { source: "/demos/mare", destination: "/demos/mare/index.html" },
        { source: "/demos/mare/:path*", destination: "/demos/mare/:path*/index.html" },
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
