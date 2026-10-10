import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["ts-morph", "@prisma/client", "prisma"],
};

export default nextConfig;
