import { revalidatePath } from "next/cache";
import { routing } from "@/i18n/routing";

/**
 * 站点启用了 next-intl，实际页面都挂在 /zh、/en 语言前缀下
 * （/ 只是中间件重定向，revalidatePath("/") 刷不到任何页面），
 * 所以所有前台刷新都要按 locale 逐个刷。
 */
function revalidateLocalePaths(path: `/${string}`) {
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}${path === "/" ? "" : path}`);
  }
}

/** 文章写操作后刷新涉及的前台 ISR/SSG 路径 */
export function revalidatePostPaths(slug: string, tagSlugs: string[] = []) {
  revalidateLocalePaths("/"); // 首页（最近文章 + 数据统计）
  revalidateLocalePaths("/posts");
  revalidateLocalePaths(`/posts/${slug}`);
  revalidateLocalePaths("/tags");
  for (const tag of tagSlugs) revalidateLocalePaths(`/tags/${tag}`);
}

/** 拾语写操作后刷新前台路径（首页台账含拾语计数） */
export function revalidateShiyuPaths() {
  revalidateLocalePaths("/shiyu");
  revalidateLocalePaths("/");
}
