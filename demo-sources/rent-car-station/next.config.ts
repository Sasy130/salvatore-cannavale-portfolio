import type { NextConfig } from "next";
const config: NextConfig = {
  basePath: "/demos/rent-car-station", output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};
export default config;
