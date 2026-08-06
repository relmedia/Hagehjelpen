import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/email"],
  images: {
    remotePatterns: [
      // Bilder lastet opp i dashbordet ligger i Supabase Storage.
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
