import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "http://100.91.95.30:3502",
    "http://localhost:3502",
    "http://127.0.0.1:3502",
  ],
};

export default nextConfig;
