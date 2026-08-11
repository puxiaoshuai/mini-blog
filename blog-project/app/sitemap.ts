import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/posts";

const BASE = "https://www.puxiaoshuai.top";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedPosts();
  const staticRoutes: MetadataRoute.Sitemap = ["", "/posts", "/tags", "/shiyu", "/about", "/search"].map(
    (p) => ({ url: `${BASE}${p}`, lastModified: new Date() })
  );
  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${BASE}/posts/${p.slug}`,
    lastModified: p.createdAt,
  }));
  return [...staticRoutes, ...postRoutes];
}
