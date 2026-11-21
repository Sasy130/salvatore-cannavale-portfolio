import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  turbopack: { root: process.cwd() },
  async headers() {
    return [{
      source: "/casa-mia/downloads/dimora-mia.apk",
      headers: [
        { key: "Content-Type", value: "application/vnd.android.package-archive" },
        { key: "Content-Disposition", value: 'attachment; filename="DIMORA-MIA-1.1.0.apk"' },
        { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        { key: "X-Content-Type-Options", value: "nosniff" },
      ],
    }];
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/", destination: "/one-man/index.html" },
        { source: "/proposte", destination: "/one-man/proposte.html" },
      ],
      afterFiles: [
        { source: "/demos/dimora-mia", destination: "/demos/dimora-mia/index.html" },
        { source: "/demos/dimora-mia/admin", destination: "/demos/dimora-mia/admin.html" },
        { source: "/demos/velar", destination: "/demos/velar/index.html" },
        { source: "/demos/velar/:path*", destination: "/demos/velar/:path*/index.html" },
        { source: "/demos/kinetic", destination: "/demos/kinetic/index.html" },
        { source: "/demos/kinetic/:path*", destination: "/demos/kinetic/:path*/index.html" },
        { source: "/demos/vera", destination: "/demos/vera/index.html" },
        { source: "/demos/vera/:path*", destination: "/demos/vera/:path*/index.html" },
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
