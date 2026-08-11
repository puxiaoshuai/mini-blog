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

/** 全部评论（含文章名），后台评论管理 */
export async function getAdminComments() {
  return prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      post: { select: { title: true, slug: true } },
      author: { select: { name: true, email: true } },
    },
  });
}

/** 后台全部拾语（含草稿），按时间倒序 */
export async function getAdminShiyus() {
  return prisma.shiyu.findMany({
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
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
}

/** 后台全部文章（含草稿） */
export async function getAdminPosts() {
  return prisma.post.findMany({
    orderBy: { updatedAt: "desc" },
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
}
