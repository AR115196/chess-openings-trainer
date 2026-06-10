import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Set by the GitHub Actions workflow; empty string for local dev
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
