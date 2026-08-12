import { revalidatePath } from "next/cache";
import { Hono } from "hono";
import type { Context } from "hono";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

/** 评论路由（挂载于 /comments，app.basePath('/api') 后即 /api/comments） */

/** 同一 IP 两次评论的最小间隔（5 分钟），防刷 */
const RATE_WINDOW_MS = 5 * 60 * 1000;

/** 取客户端真实 IP（宝塔 = Nginx 反代，按可信度逐级尝试）
 *  - cf-connecting-ip：Cloudflare 专用头（仅在有 CF 时可信，直连可伪造）
 *  - x-real-ip：Nginx 用 $remote_addr 直填，客户端伪造不了，无 CDN 时最可信
 *  - x-forwarded-for 取最右：Nginx 用 $proxy_add_x_forwarded_for「追加」直连 IP，
 *    最右一段 = Nginx 看到的真实对端；最左可被客户端伪造，绝不能取首段
 */
function getClientIp(c: Context): string | null {
  const cf = c.req.header("cf-connecting-ip");
  if (cf) return cf.trim();
  const real = c.req.header("x-real-ip");
  if (real) return real.trim();
  const fwd = c.req.header("x-forwarded-for");
  if (fwd) {
    console.log("ip", fwd); // 调试：确认 Nginx 透传了哪些 IP，验完可删
    const parts = fwd.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }
  return null;
}

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
    if (content.length > 100) {
      return c.json({ error: "评论内容最多 100 字" }, 400);
    }

    // 按 IP 限流：5 分钟内同一 IP 最多一条评论（取不到 IP 时不拦截，Nginx 配好透传后必带）
    const ip = getClientIp(c);
    if (ip) {
      const recent = await prisma.comment.findFirst({
        where: { ip, createdAt: { gte: new Date(Date.now() - RATE_WINDOW_MS) } },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      });
      if (recent) {
        const remainSec = Math.max(1, Math.ceil((RATE_WINDOW_MS - (Date.now() - recent.createdAt.getTime())) / 1000));
        const min = Math.floor(remainSec / 60);
        const sec = remainSec % 60;
        const label = min > 0 ? `${min} 分 ${sec} 秒` : `${sec} 秒`;
        return c.json({ error: `评论太频繁了，请 ${label} 后再试` }, 429);
      }
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
      data: { content, postId: post.id, authorId: author.id, published: false, ip },
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
