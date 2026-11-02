import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ws must load through native require: bundling it breaks its optional native helpers.
  serverExternalPackages: ["ws"],
};

export default nextConfig;
