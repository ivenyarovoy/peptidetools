import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML export -> deployable on Cloudflare Pages (free tier) with no server.
  output: "export",
  // Required for static export so links resolve as directories.
  trailingSlash: true,
  images: {
    // next/image optimization needs a server; disable for static export.
    unoptimized: true,
  },
};

export default nextConfig;
