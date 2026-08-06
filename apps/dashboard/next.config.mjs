/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  transpilePackages: ["@repo/email"],
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  experimental: {
    serverActions: {
      // Image uploads go through a Server Action; default is 1 MB.
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
