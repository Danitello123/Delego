import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@delego/ui", "@delego/sdk", "@delego/types"],
};

export default nextConfig;
