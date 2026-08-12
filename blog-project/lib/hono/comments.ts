import { revalidatePath } from "next/cache";
import { Hono } from "hono";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

/** 评论路由（挂载于 /comments，app.basePath('/api') 后即 /api/comments） */
export const comments = new Hono()
  // GET /api/comments — 全部评论（ADMIN，后台管理用）
  .get("/", async (c) => {
    const session = await requireAdmin();
    if (!session) {
      return c.json({ error: "未登录或权限不足" }, 401);
    }
    const list = await prisma.comment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        post: { select: { title: true, slug: true } },
        author: { select: { name: true, email: true } },
      },
    });
    return c.json(list);
  })
  // POST /api/comments — 访客提交评论（公开，默认待审核）
  .post("/", async (c) => {
    let body: { postId?: string; name?: string; email?: string; content?: string };
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "请求体不是合法 JSON" }, 400);
    }

    const content = body.content?.trim();
    const name = body.name?.trim();
    if (!content || !name) {
      return c.json({ error: "昵称与内容不能为空" }, 400);
    }
    const post = await prisma.post.findUnique({
      where: { id: body.postId },
      select: { id: true, slug: true, title: true },
    });
    if (!post) {
      return c.json({ error: "文章不存在" }, 404);
    }

    // 访客按邮箱 find-or-create（仅存显示名，无密码不可登录）
    const email = (body.email?.trim() || `${Date.now()}@guest.local`).toLowerCase();
    const author = await prisma.user.upsert({
      where: { email },
      update: { name },
      create: { email, name, role: "USER" },
    });

    const comment = await prisma.comment.create({
      data: { content, postId: post.id, authorId: author.id, published: false },
    });
    revalidatePath(`/posts/${post.slug}`);
    return c.json(comment, 201);
  })
  // PUT /api/comments/:id — 审核通过 / 转为待审（ADMIN）
  .put("/:id", async (c) => {
    const session = await requireAdmin();
    if (!session) {
      return c.json({ error: "未登录或权限不足" }, 401);
    }
    const id = c.req.param("id");

    const existing = await prisma.comment.findUnique({
      where: { id },
      include: { post: { select: { slug: true } } },
    });
    if (!existing) return c.json({ error: "评论不存在" }, 404);

    let body: { published?: boolean };
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "请求体不是合法 JSON" }, 400);
    }
    if (typeof body.published !== "boolean") {
      return c.json({ error: "published 必须为布尔值" }, 400);
    }

    const comment = await prisma.comment.update({
      where: { id },
      data: { published: body.published },
    });
    revalidatePath(`/posts/${existing.post.slug}`);
    return c.json(comment);
  })
  // DELETE /api/comments/:id — 删除评论（ADMIN）
  .delete("/:id", async (c) => {
    const session = await requireAdmin();
    if (!session) {
      return c.json({ error: "未登录或权限不足" }, 401);
    }
    const id = c.req.param("id");

    const existing = await prisma.comment.findUnique({
      where: { id },
      include: { post: { select: { slug: true } } },
    });
    if (!existing) return c.json({ error: "评论不存在" }, 404);

    await prisma.comment.delete({ where: { id } });
    revalidatePath(`/posts/${existing.post.slug}`);
    return c.json({ ok: true });
  });
