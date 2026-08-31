import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray package-lock.json in the home directory makes Next mis-detect
  // the workspace root — pin it to this project.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
