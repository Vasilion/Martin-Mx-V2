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
      { source: "/print-list", destination: "/print", permanent: true },
    ];
  },
};

export default nextConfig;
