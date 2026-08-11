import { prisma } from "@/lib/db";

export type PostCard = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  createdAt: Date;
  tags: { name: string; slug: string }[];
};

/** 已发布文章列表（卡片/列表用） */
export async function getPublishedPosts(): Promise<PostCard[]> {
  return prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      createdAt: true,
      tags: { select: { name: true, slug: true } },
    },
  });
}

/** 文章详情（按 slug，仅已发布） */
export async function getPostBySlug(slug: string) {
  return prisma.post.findFirst({
    where: { slug, published: true },
    include: {
      author: { select: { name: true, image: true } },
      tags: { select: { name: true, slug: true } },
    },
  });
}

/** 全部标签（含文章数），按名称排序 */
export async function getAllTags() {
  const tags = await prisma.tag.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: "asc" },
  });
  return tags.map((t) => ({ name: t.name, slug: t.slug, count: t._count.posts }));
}

/** 某标签下已发布文章 */
export async function getPostsByTag(tagSlug: string) {
  return prisma.tag.findUnique({
    where: { slug: tagSlug },
    include: {
      posts: {
        where: { published: true },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          createdAt: true,
        },
      },
    },
  });
}

/** 文章详情页：上一篇 / 下一篇 */
export async function getAdjacentPosts(slug: string) {
  const post = await prisma.post.findUnique({
    where: { slug },
    select: { createdAt: true },
  });
  if (!post) return { prev: null, next: null };

  const [prev, next] = await Promise.all([
    prisma.post.findFirst({
      where: { published: true, createdAt: { lt: post.createdAt } },
      orderBy: { createdAt: "desc" },
      select: { title: true, slug: true },
    }),
    prisma.post.findFirst({
      where: { published: true, createdAt: { gt: post.createdAt } },
      orderBy: { createdAt: "asc" },
      select: { title: true, slug: true },
    }),
  ]);
  return { prev, next };
}

/** 首页数据台账：真实计数 */
export async function getStats() {
  const [posts, views, tags, shiyus] = await Promise.all([
    prisma.post.count({ where: { published: true } }),
    prisma.post.aggregate({
      _sum: { views: true },
      where: { published: true },
    }),
    prisma.tag.count(),
    prisma.shiyu.count({ where: { published: true } }),
  ]);
  return { posts, views: views._sum.views ?? 0, tags, shiyus };
}
