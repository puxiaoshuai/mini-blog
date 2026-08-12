import GithubSlugger from "github-slugger";
import { prisma } from "@/lib/db";

export type PostCard = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  createdAt: Date;
  views: number;
  readingMinutes: number;
  tags: { name: string; slug: string }[];
};

/** 拉取已发布文章卡片（分页内部共用），含封面、阅数、阅读时长 */
async function fetchPostCards(skip: number, take: number): Promise<PostCard[]> {
  const rows = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    skip,
    take,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImage: true,
      views: true,
      content: true,
      createdAt: true,
      tags: { select: { name: true, slug: true } },
    },
  });
  return rows.map(({ content, ...p }) => ({
    ...p,
    readingMinutes: Math.max(1, Math.round(content.length / 400)),
  }));
}

/** 已发布文章全量（首页/静态参数/sitemap 用） */
export async function getPublishedPosts(): Promise<PostCard[]> {
  return fetchPostCards(0, 100_000);
}

/** 已发布文章分页（文章列表页用） */
export async function getPublishedPostsPage({
  page = 1,
  pageSize = 20,
}: { page?: number; pageSize?: number } = {}) {
  const skip = (page - 1) * pageSize;
  const [total, items] = await Promise.all([
    prisma.post.count({ where: { published: true } }),
    fetchPostCards(skip, pageSize),
  ]);
  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
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

/** 文章详情页：已通过审核的评论 */
export async function getPublishedComments(postId: string) {
  return prisma.comment.findMany({
    where: { postId, published: true },
    orderBy: { createdAt: "asc" },
    include: { author: { select: { name: true } } },
  });
}

/**
 * 全文搜索：标题 / 摘要 / 正文 LIKE 命中（开发与通用环境）。
 * 生产数据量大时可切 PostgreSQL `tsvector` 全文索引（见技术方案 M5-1）。
 */
export async function searchPosts(q: string): Promise<PostCard[]> {
  const kw = q.trim();
  if (!kw) return [];
  const rows = await prisma.post.findMany({
    where: {
      published: true,
      OR: [
        { title: { contains: kw } },
        { excerpt: { contains: kw } },
        { content: { contains: kw } },
      ],
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImage: true,
      views: true,
      content: true,
      createdAt: true,
      tags: { select: { name: true, slug: true } },
    },
  });
  return rows.map(({ content, ...p }) => ({
    ...p,
    readingMinutes: Math.max(1, Math.round(content.length / 400)),
  }));
}

/** 管理端：按 id 取文章（含草稿、标签名），供编辑表单 */
export async function getAdminPostById(id: string) {
  return prisma.post.findUnique({
    where: { id },
    include: { tags: { select: { name: true, slug: true } } },
  });
}

/** 按名称 upsert 标签并返回 id 列表（新建文章/编辑时复用） */
export async function upsertTags(names: string[]): Promise<string[]> {
  const slugger = new GithubSlugger();
  const ids: string[] = [];
  for (const raw of names) {
    const name = raw.trim();
    if (!name) continue;
    const tag = await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name, slug: slugger.slug(name) },
    });
    ids.push(tag.id);
  }
  return ids;
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
