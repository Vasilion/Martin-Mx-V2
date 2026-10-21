import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  allowedDevOrigins: ["127.0.0.1"],
  async redirects() {
    return [
      { source: "/home", destination: "/", permanent: true },
      { source: "/hiring-form", destination: "/hiring", permanent: true },
      { source: "/print-list", destination: "/admin/riders", permanent: true },
      { source: "/print", destination: "/admin/riders", permanent: false },
    ];
  },
};

export default nextConfig;
