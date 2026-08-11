import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

type Ctx = { params: Promise<{ id: string }> };

/** PUT /api/comments/[id] — 审核通过 / 转为待审（ADMIN） */
export async function PUT(request: Request, ctx: Ctx) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "未登录或权限不足" }, { status: 401 });
  }
  const { id } = await ctx.params;

  const existing = await prisma.comment.findUnique({
    where: { id },
    include: { post: { select: { slug: true } } },
  });
  if (!existing) return NextResponse.json({ error: "评论不存在" }, { status: 404 });

  let body: { published?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求体不是合法 JSON" }, { status: 400 });
  }
  if (typeof body.published !== "boolean") {
    return NextResponse.json({ error: "published 必须为布尔值" }, { status: 400 });
  }

  const comment = await prisma.comment.update({
    where: { id },
    data: { published: body.published },
  });
  revalidatePath(`/posts/${existing.post.slug}`);
  return NextResponse.json(comment);
}

/** DELETE /api/comments/[id] — 删除评论（ADMIN） */
export async function DELETE(_req: Request, ctx: Ctx) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "未登录或权限不足" }, { status: 401 });
  }
  const { id } = await ctx.params;

  const existing = await prisma.comment.findUnique({
    where: { id },
    include: { post: { select: { slug: true } } },
  });
  if (!existing) return NextResponse.json({ error: "评论不存在" }, { status: 404 });

  await prisma.comment.delete({ where: { id } });
  revalidatePath(`/posts/${existing.post.slug}`);
  return NextResponse.json({ ok: true });
}
