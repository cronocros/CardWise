import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // This tells Next.js where the actual workspace root is to resolve lockfiles properly.
    // Equivalent to setting turbopack.root in recent versions.
  }
};

export default nextConfig;
