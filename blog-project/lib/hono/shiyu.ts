import { revalidatePath } from "next/cache";
import { Hono } from "hono";
import { prisma } from "@/lib/db";
import { getShiyus, getNextShiyuNo, toShiyuItem, getShiyuById } from "@/lib/shiyu";
import { requireAdmin } from "@/lib/auth";

type ShiyuBody = {
  content?: string;
  images?: string[];
  pinned?: boolean;
  published?: boolean;
};

/** 拾语路由（挂载于 /shiyu，app.basePath('/api') 后即 /api/shiyu） */
export const shiyu = new Hono()
  // GET /api/shiyu?page=1&pageSize=10 — 拾语流（公开，置顶优先 + 时间倒序 + 分页）
  .get("/", async (c) => {
    const page = Math.max(1, Number(c.req.query("page")) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(c.req.query("pageSize")) || 10));
    return c.json(await getShiyus({ page, pageSize }));
  })
  // POST /api/shiyu — 新建拾语（ADMIN）
  .post("/", async (c) => {
    const session = await requireAdmin();
    if (!session) {
      return c.json({ error: "未登录或权限不足" }, 401);
    }

    let body: ShiyuBody;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "请求体不是合法 JSON" }, 400);
    }

    const content = body.content?.trim();
    if (!content) {
      return c.json({ error: "内容不能为空" }, 400);
    }

    const created = await prisma.shiyu.create({
      data: {
        no: await getNextShiyuNo(),
        content,
        images:
          Array.isArray(body.images) && body.images.length
            ? JSON.stringify(body.images)
            : null,
        pinned: body.pinned ?? false,
        published: body.published ?? true,
        authorId: session.userId,
      },
    });

    // 拾语页为 ISR，写后按需刷新（首页台账含拾语计数，一并刷新）
    revalidatePath("/shiyu");
    revalidatePath("/");

    return c.json(toShiyuItem(created), 201);
  })
  // GET /api/shiyu/:id — 单条拾语（公开，仅已发布）
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    const item = await getShiyuById(id);
    if (!item) {
      return c.json({ error: "拾语不存在" }, 404);
    }
    return c.json(item);
  })
  // PUT /api/shiyu/:id — 更新拾语（ADMIN）
  .put("/:id", async (c) => {
    const session = await requireAdmin();
    if (!session) {
      return c.json({ error: "未登录或权限不足" }, 401);
    }

    const id = c.req.param("id");
    const existing = await prisma.shiyu.findUnique({ where: { id } });
    if (!existing) {
      return c.json({ error: "拾语不存在" }, 404);
    }

    let body: ShiyuBody;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "请求体不是合法 JSON" }, 400);
    }

    // 显式传入内容时不允许为空；未传的字段保持原值
    if ("content" in body && !body.content?.trim()) {
      return c.json({ error: "内容不能为空" }, 400);
    }

    const updated = await prisma.shiyu.update({
      where: { id },
      data: {
        content: typeof body.content === "string" ? body.content.trim() : undefined,
        images: Array.isArray(body.images)
          ? body.images.length
            ? JSON.stringify(body.images)
            : null
          : undefined,
        pinned: typeof body.pinned === "boolean" ? body.pinned : undefined,
        published: typeof body.published === "boolean" ? body.published : undefined,
      },
    });

    revalidatePath("/shiyu");
    revalidatePath("/");

    return c.json(toShiyuItem(updated));
  })
  // DELETE /api/shiyu/:id — 删除拾语（ADMIN）
  .delete("/:id", async (c) => {
    const session = await requireAdmin();
    if (!session) {
      return c.json({ error: "未登录或权限不足" }, 401);
    }

    const id = c.req.param("id");
    const existing = await prisma.shiyu.findUnique({ where: { id } });
    if (!existing) {
      return c.json({ error: "拾语不存在" }, 404);
    }

    await prisma.shiyu.delete({ where: { id } });

    revalidatePath("/shiyu");
    revalidatePath("/");

    return c.json({ ok: true });
  });
