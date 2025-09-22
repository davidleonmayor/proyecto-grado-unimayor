import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns:[
      {hostname: 'images.pexels.com'},
    ],
  },
  reactStrictMode: true,
  output: "standalone",
};

export default nextConfig;
 