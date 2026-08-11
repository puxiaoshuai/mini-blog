import { revalidatePath } from "next/cache";

/** 文章写操作后刷新涉及的前台 ISR/SSG 路径 */
export function revalidatePostPaths(slug: string, tagSlugs: string[] = []) {
  revalidatePath("/");
  revalidatePath("/posts");
  revalidatePath(`/posts/${slug}`);
  revalidatePath("/tags");
  for (const tag of tagSlugs) revalidatePath(`/tags/${tag}`);
}

/** 拾语写操作后刷新前台路径（首页台账含拾语计数） */
export function revalidateShiyuPaths() {
  revalidatePath("/shiyu");
  revalidatePath("/");
}
