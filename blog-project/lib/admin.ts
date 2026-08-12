import { prisma } from "@/lib/db";

/** 后台概览：四格统计（真实计数） */
export async function getDashboardStats() {
  const [postCount, publishedPosts, draftPosts, views, shiyuCount, commentCount, pendingComments, tagCount] =
    await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { published: true } }),
      prisma.post.count({ where: { published: false } }),
      prisma.post.aggregate({ _sum: { views: true } }),
      prisma.shiyu.count(),
      prisma.comment.count(),
      prisma.comment.count({ where: { published: false } }),
      prisma.tag.count(),
    ]);
  return {
    postCount,
    publishedPosts,
    draftPosts,
    views: views._sum.views ?? 0,
    shiyuCount,
    commentCount,
    pendingComments,
    tagCount,
  };
}

/** 后台最新文章（含草稿，全部状态） */
export async function getRecentPosts(limit = 5) {
  return prisma.post.findMany({
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      slug: true,
      published: true,
      views: true,
      likes: true,
      updatedAt: true,
      tags: { select: { name: true, slug: true } },
    },
  });
}

/** 待审核评论 */
export async function getPendingComments(limit = 5) {
  return prisma.comment.findMany({
    where: { published: false },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      post: { select: { title: true, slug: true } },
      author: { select: { name: true } },
    },
  });
}

/** 后台评论分页（含文章名），按时间倒序 */
export async function getAdminComments({ page = 1, pageSize = 10 } = {}) {
  const total = await prisma.comment.count();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const items = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    skip: (safePage - 1) * pageSize,
    take: pageSize,
    include: {
      post: { select: { title: true, slug: true } },
      author: { select: { name: true, email: true } },
    },
  });
  return { items, total, page: safePage, pageSize, totalPages };
}

/** 待审核评论数（评论区头部徽标） */
export async function getPendingCommentCount() {
  return prisma.comment.count({ where: { published: false } });
}

/** 后台拾语分页（含草稿），置顶在前、按时间倒序 */
export async function getAdminShiyus({ page = 1, pageSize = 10 } = {}) {
  const total = await prisma.shiyu.count();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const items = await prisma.shiyu.findMany({
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    skip: (safePage - 1) * pageSize,
    take: pageSize,
    select: {
      id: true,
      no: true,
      content: true,
      images: true,
      pinned: true,
      published: true,
      createdAt: true,
    },
  });
  return { items, total, page: safePage, pageSize, totalPages };
}

/** 后台文章分页（含草稿），按更新时间倒序 */
export async function getAdminPosts({ page = 1, pageSize = 10 } = {}) {
  const total = await prisma.post.count();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const items = await prisma.post.findMany({
    orderBy: { updatedAt: "desc" },
    skip: (safePage - 1) * pageSize,
    take: pageSize,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      published: true,
      views: true,
      likes: true,
      createdAt: true,
      updatedAt: true,
      tags: { select: { name: true, slug: true } },
    },
  });
  return { items, total, page: safePage, pageSize, totalPages };
}
