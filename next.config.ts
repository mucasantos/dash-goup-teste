import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  productionBrowserSourceMaps: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "goup-dash.vercel.app",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination: "https://sea-lion-app-cyclv.ondigitalocean.app/:path*",
      },
      {
        source: "/api/wp-proxy/:path*",
        destination: "https://goupsolutions.pt/wp-json/jwt-auth/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
