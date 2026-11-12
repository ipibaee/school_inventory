import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["inventaris.ipibaee.my.id"],
    },
  },
};

export default nextConfig;

