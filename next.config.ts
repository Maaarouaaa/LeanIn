import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Allow Cursor port-forward / local preview hosts to use HMR in dev.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
