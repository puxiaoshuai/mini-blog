import type { MetadataRoute } from "next";
import { getPublishedPostRefs } from "@/lib/posts";

const BASE = "https://www.puxiaoshuai.top";
const LOCALES = ["zh", "en"] as const;
const STATIC_PATHS = ["", "/posts", "/tags", "/shiyu", "/about", "/search"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedPostRefs();

  const staticRoutes: MetadataRoute.Sitemap = STATIC_PATHS.flatMap((p) =>
    LOCALES.map((locale) => ({
      url: `${BASE}/${locale}${p}`,
      lastModified: new Date(),
      alternates: {
        languages: {
          zh: `${BASE}/zh${p}`,
          en: `${BASE}/en${p}`,
        },
      },
    }))
  );

  const postRoutes: MetadataRoute.Sitemap = posts.flatMap((p) =>
    LOCALES.map((locale) => ({
      url: `${BASE}/${locale}/posts/${p.slug}`,
      lastModified: p.createdAt,
      alternates: {
        languages: {
          zh: `${BASE}/zh/posts/${p.slug}`,
          en: `${BASE}/en/posts/${p.slug}`,
        },
      },
    }))
  );

  return [...staticRoutes, ...postRoutes];
}
