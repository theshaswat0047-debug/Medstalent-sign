import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NOTE: do NOT set `output: "standalone"` — it breaks Vercel deploys.
  // Standalone output is only for self-hosting (Docker / VPS).
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
