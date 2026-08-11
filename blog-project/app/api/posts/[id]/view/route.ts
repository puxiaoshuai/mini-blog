import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

/** POST /api/posts/[id]/view — 浏览 +1（公开；前端按会话去重） */
export async function POST(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const post = await prisma.post.findUnique({ where: { id }, select: { id: true } });
  if (!post) return NextResponse.json({ error: "文章不存在" }, { status: 404 });

  const updated = await prisma.post.update({
    where: { id },
    data: { views: { increment: 1 } },
    select: { views: true },
  });
  return NextResponse.json({ views: updated.views });
}
