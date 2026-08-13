import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/api/", "/zh/dashboard", "/en/dashboard"],
      },
    ],
    sitemap: "https://www.puxiaoshuai.top/sitemap.xml",
  };
}
