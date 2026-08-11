import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/api/auth", "/api/"],
      },
    ],
    sitemap: "https://www.puxiaoshuai.top/sitemap.xml",
  };
}
