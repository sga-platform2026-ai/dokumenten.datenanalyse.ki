import type { NextConfig } from "next";

const NOINDEX_HEADER_VALUE = "noindex, nofollow, noarchive, nosnippet";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/pdf.worker.min.mjs",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: NOINDEX_HEADER_VALUE,
          },
        ],
      },
    ];
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
