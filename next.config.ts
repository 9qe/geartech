import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GitHub Pages project site serves under /<repo> — empty for local/Vercel.
  basePath: process.env.NEXT_BASE_PATH || "",
  // Set NEXT_STATIC_EXPORT=1 for the GitHub Pages build (see scripts/static-export.mjs).
  output: process.env.NEXT_STATIC_EXPORT === "1" ? "export" : undefined,
  images: { unoptimized: true },
};

export default nextConfig;
