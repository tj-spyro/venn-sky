import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/venn-sky",
  // Disable image optimization for static export compatibility
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
