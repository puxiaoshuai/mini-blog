import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 拾语配图 / 文章封面：种子暂用 Unsplash，生产换图床后在此追加域名
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "http", hostname: "piclink.puxiaoshuai.top" },
    ],
  },
  // 开发期工具：LocatorJS。编译期给 tsx/jsx 注入 data-locatorjs（带源码路径），
  // 配合 @locator/runtime 的 setup() 实现 Option+Click 跳源码。仅 dev 生效。
  turbopack: {
    rules: {
      "**/*.{tsx,jsx}": {
        loaders: [
          {
            loader: "@locator/webpack-loader",
            options: { env: "development" },
          },
        ],
      },
    },
  },
};

export default nextConfig;
