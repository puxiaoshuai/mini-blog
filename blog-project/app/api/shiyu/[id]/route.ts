import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getShiyuById, toShiyuItem } from "@/lib/shiyu";
import { requireAdmin } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/shiyu/[id] — 单条拾语（公开，仅已发布） */
export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const item = await getShiyuById(id);
  if (!item) {
    return NextResponse.json({ error: "拾语不存在" }, { status: 404 });
  }
  return NextResponse.json(item);
}

/** PUT /api/shiyu/[id] — 更新拾语（ADMIN） */
export async function PUT(request: Request, ctx: Ctx) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "未登录或权限不足" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const existing = await prisma.shiyu.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "拾语不存在" }, { status: 404 });
  }

  let body: {
    content?: string;
    images?: string[];
    pinned?: boolean;
    published?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求体不是合法 JSON" }, { status: 400 });
  }

  // 显式传入内容时不允许为空；未传的字段保持原值
  if ("content" in body && !body.content?.trim()) {
    return NextResponse.json({ error: "内容不能为空" }, { status: 400 });
  }

  const shiyu = await prisma.shiyu.update({
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

  return NextResponse.json(toShiyuItem(shiyu));
}

/** DELETE /api/shiyu/[id] — 删除拾语（ADMIN） */
export async function DELETE(_req: Request, ctx: Ctx) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "未登录或权限不足" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const existing = await prisma.shiyu.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "拾语不存在" }, { status: 404 });
  }

  await prisma.shiyu.delete({ where: { id } });

  revalidatePath("/shiyu");
  revalidatePath("/");

  return NextResponse.json({ ok: true });
}
