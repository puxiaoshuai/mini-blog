import { Hono } from "hono";
import GithubSlugger from "github-slugger";
import { prisma } from "@/lib/db";
import { upsertTags, getPublishedPostsPage } from "@/lib/posts";
import { requireAdmin } from "@/lib/auth";
import { revalidatePostPaths } from "@/lib/revalidate";
import { randomCover } from "@/lib/coverPresets";
import { calcReadingMinutes } from "@/lib/utils";
import { getClientIp } from "@/lib/hono/ip";
import { checkRateLimit } from "@/lib/hono/rateLimit";

/** 阅/赞接口服务端限流：同一 IP 同一文章的最小间隔（前端已有会话去重，此为防线） */
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 1;

type PostBody = {
  title?: string;
  slug?: string;
  excerpt?: string | null;
  content?: string;
  coverImage?: string | null;
  published?: boolean;
  tags?: string[];
  createdAt?: string | null;
};

/** 判断日期是否严格晚于今天（按服务器本地日期），不允许把文章时间改到未来 */
function isFutureDay(date: Date): boolean {
  const now = new Date();
  const day = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return day(date) > day(now);
}

/** 解析客户端传来的创建时间：空 → undefined（走默认）；非法 / 未来 → 返回错误 */
function parseCreatedAt(
  value: string | null | undefined
): { date?: Date; error?: string } {
  if (!value) return {};
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { error: "创建时间格式不正确" };
  if (isFutureDay(date)) return { error: "创建时间不能晚于今天" };
  return { date };
}

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
    const { date: createdAt, error: createdAtError } = parseCreatedAt(body.createdAt);
    if (createdAtError) return c.json({ error: createdAtError }, 400);

    try {
      const content = body.content ?? "";
      const post = await prisma.post.create({
        data: {
          title,
          slug,
          excerpt: body.excerpt?.trim() || null,
          content,
          readingMinutes: calcReadingMinutes(content),
          coverImage: body.coverImage?.trim() || randomCover(),
          published: body.published ?? true,
          authorId: session.userId,
          ...(createdAt ? { createdAt } : {}),
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
    const { date: createdAt, error: createdAtError } = parseCreatedAt(body.createdAt);
    if (createdAtError) return c.json({ error: createdAtError }, 400);

    try {
      const content = body.content ?? existing.content;
      const post = await prisma.post.update({
        where: { id },
        data: {
          title: body.title?.trim() ?? existing.title,
          slug,
          excerpt: "excerpt" in body ? (body.excerpt?.trim() || null) : existing.excerpt,
          content,
          readingMinutes: calcReadingMinutes(content),
          coverImage: "coverImage" in body ? (body.coverImage?.trim() || null) : existing.coverImage,
          published: body.published ?? existing.published,
          ...(createdAt ? { createdAt } : {}),
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
  // POST /api/posts/:id/like — 点赞 +1（公开；前端防连点 + 服务端按 IP 限流）
  .post("/:id/like", async (c) => {
    const id = c.req.param("id");
    const ip = getClientIp(c);
    const wait = ip ? checkRateLimit(`like:${ip}:${id}`, RATE_WINDOW_MS, RATE_MAX) : 0;
    if (wait > 0) return c.json({ error: `操作太频繁，请 ${wait} 秒后再试` }, 429);

    const post = await prisma.post.findUnique({ where: { id }, select: { id: true } });
    if (!post) return c.json({ error: "文章不存在" }, 404);

    const updated = await prisma.post.update({
      where: { id },
      data: { likes: { increment: 1 } },
      select: { likes: true },
    });
    return c.json({ likes: updated.likes });
  })
  // POST /api/posts/:id/view — 浏览 +1（公开；前端按会话去重 + 服务端按 IP 限流）
  .post("/:id/view", async (c) => {
    const id = c.req.param("id");
    const ip = getClientIp(c);
    const wait = ip ? checkRateLimit(`view:${ip}:${id}`, RATE_WINDOW_MS, RATE_MAX) : 0;
    if (wait > 0) return c.json({ error: `操作太频繁，请 ${wait} 秒后再试` }, 429);

    const post = await prisma.post.findUnique({ where: { id }, select: { id: true } });
    if (!post) return c.json({ error: "文章不存在" }, 404);

    const updated = await prisma.post.update({
      where: { id },
      data: { views: { increment: 1 } },
      select: { views: true },
    });
    return c.json({ views: updated.views });
  });
