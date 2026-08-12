import { Hono } from "hono";
import GithubSlugger from "github-slugger";
import { prisma } from "@/lib/db";
import { upsertTags, getPublishedPostsPage } from "@/lib/posts";
import { requireAdmin } from "@/lib/auth";
import { revalidatePostPaths } from "@/lib/revalidate";
import { randomCover } from "@/lib/coverPresets";

type PostBody = {
  title?: string;
  slug?: string;
  excerpt?: string | null;
  content?: string;
  coverImage?: string | null;
  published?: boolean;
  tags?: string[];
};

/** 文章路由（挂载于 /posts，app.basePath('/api') 后即 /api/posts） */
export const posts = new Hono()
  // GET /api/posts?page=1&pageSize=20 — 已发布文章分页（公开）
  .get("/", async (c) => {
    const page = Math.max(1, Number(c.req.query("page")) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(c.req.query("pageSize")) || 20));
    return c.json(await getPublishedPostsPage({ page, pageSize }));
  })
  // POST /api/posts — 新建文章（ADMIN）
  .post("/", async (c) => {
    const session = await requireAdmin();
    if (!session) {
      return c.json({ error: "未登录或权限不足" }, 401);
    }

    let body: PostBody;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "请求体不是合法 JSON" }, 400);
    }

    const title = body.title?.trim();
    if (!title) {
      return c.json({ error: "标题不能为空" }, 400);
    }

    const slugger = new GithubSlugger();
    const slug = body.slug?.trim() || slugger.slug(title);
    const tagIds = await upsertTags(body.tags ?? []);

    try {
      const post = await prisma.post.create({
        data: {
          title,
          slug,
          excerpt: body.excerpt?.trim() || null,
          content: body.content ?? "",
          coverImage: body.coverImage?.trim() || randomCover(),
          published: body.published ?? true,
          authorId: session.userId,
          tags: { connect: tagIds.map((id) => ({ id })) },
        },
      });
      const tagSlugs = (body.tags ?? []).map((t) => t.trim()).filter(Boolean);
      revalidatePostPaths(post.slug, tagSlugs);
      return c.json(post, 201);
    } catch (e) {
      if (e instanceof Error && "code" in (e as object) && (e as { code?: string }).code === "P2002") {
        return c.json({ error: "slug 已存在，请更换" }, 409);
      }
      throw e;
    }
  })
  // GET /api/posts/:id — 文章详情（公开，仅已发布）
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    const post = await prisma.post.findFirst({
      where: { id, published: true },
      include: { tags: { select: { name: true, slug: true } } },
    });
    if (!post) return c.json({ error: "文章不存在" }, 404);
    return c.json(post);
  })
  // PUT /api/posts/:id — 更新文章（ADMIN）
  .put("/:id", async (c) => {
    const session = await requireAdmin();
    if (!session) {
      return c.json({ error: "未登录或权限不足" }, 401);
    }
    const id = c.req.param("id");

    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) return c.json({ error: "文章不存在" }, 404);

    let body: PostBody;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "请求体不是合法 JSON" }, 400);
    }

    if ("title" in body && !body.title?.trim()) {
      return c.json({ error: "标题不能为空" }, 400);
    }

    const slugger = new GithubSlugger();
    const slug =
      body.slug?.trim() ||
      (body.title?.trim() ? slugger.slug(body.title.trim()) : existing.slug);
    const tagIds = body.tags ? await upsertTags(body.tags) : undefined;

    try {
      const post = await prisma.post.update({
        where: { id },
        data: {
          title: body.title?.trim() ?? existing.title,
          slug,
          excerpt: "excerpt" in body ? (body.excerpt?.trim() || null) : existing.excerpt,
          content: body.content ?? existing.content,
          coverImage: "coverImage" in body ? (body.coverImage?.trim() || null) : existing.coverImage,
          published: body.published ?? existing.published,
          tags: tagIds ? { set: [], connect: tagIds.map((tid) => ({ id: tid })) } : undefined,
        },
      });
      const tagSlugs = (body.tags ?? []).map((t) => t.trim()).filter(Boolean);
      revalidatePostPaths(slug, tagSlugs);
      return c.json(post);
    } catch (e) {
      if (e instanceof Error && (e as { code?: string }).code === "P2002") {
        return c.json({ error: "slug 已存在，请更换" }, 409);
      }
      throw e;
    }
  })
  // DELETE /api/posts/:id — 删除文章（ADMIN）
  .delete("/:id", async (c) => {
    const session = await requireAdmin();
    if (!session) {
      return c.json({ error: "未登录或权限不足" }, 401);
    }
    const id = c.req.param("id");

    const existing = await prisma.post.findUnique({
      where: { id },
      include: { tags: { select: { slug: true } } },
    });
    if (!existing) return c.json({ error: "文章不存在" }, 404);

    await prisma.post.delete({ where: { id } });
    revalidatePostPaths(existing.slug, existing.tags.map((t) => t.slug));
    return c.json({ ok: true });
  })
  // POST /api/posts/:id/like — 点赞 +1（公开；防重复刷新由前端控制）
  .post("/:id/like", async (c) => {
    const id = c.req.param("id");
    const post = await prisma.post.findUnique({ where: { id }, select: { id: true } });
    if (!post) return c.json({ error: "文章不存在" }, 404);

    const updated = await prisma.post.update({
      where: { id },
      data: { likes: { increment: 1 } },
      select: { likes: true },
    });
    return c.json({ likes: updated.likes });
  })
  // POST /api/posts/:id/view — 浏览 +1（公开；前端按会话去重）
  .post("/:id/view", async (c) => {
    const id = c.req.param("id");
    const post = await prisma.post.findUnique({ where: { id }, select: { id: true } });
    if (!post) return c.json({ error: "文章不存在" }, 404);

    const updated = await prisma.post.update({
      where: { id },
      data: { views: { increment: 1 } },
      select: { views: true },
    });
    return c.json({ views: updated.views });
  });
