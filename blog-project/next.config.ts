import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 拾语配图 / 文章封面：种子暂用 Unsplash，生产换图床后在此追加域名
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
