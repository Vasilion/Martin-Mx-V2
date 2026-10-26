import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  allowedDevOrigins: ["127.0.0.1", "192.168.1.*"],
  devIndicators: false,
  // Owner PDFs are read from disk by /admin/guides/[file]; ship them with the server bundle.
  outputFileTracingIncludes: {
    "/admin/guides/[file]": ["./docs/owner/**/*"],
  },
  async redirects() {
    return [
      { source: "/home", destination: "/", permanent: true },
      { source: "/hiring-form", destination: "/hiring", permanent: true },
      { source: "/print-list", destination: "/admin/riders", permanent: true },
      { source: "/print", destination: "/admin/riders", permanent: false },
      // Old site waiver links (shared on Facebook, printed QR codes).
      { source: "/images/waivers/:file", destination: "/media/waivers/:file", permanent: true },
    ];
  },
};

export default nextConfig;
