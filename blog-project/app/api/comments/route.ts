import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/** GET /api/comments — 全部评论（ADMIN，后台管理用） */
export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "未登录或权限不足" }, { status: 401 });
  }
  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      post: { select: { title: true, slug: true } },
      author: { select: { name: true, email: true } },
    },
  });
  return NextResponse.json(comments);
}

/** POST /api/comments — 访客提交评论（公开，默认待审核） */
export async function POST(request: Request) {
  let body: { postId?: string; name?: string; email?: string; content?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求体不是合法 JSON" }, { status: 400 });
  }

  const content = body.content?.trim();
  const name = body.name?.trim();
  if (!content || !name) {
    return NextResponse.json({ error: "昵称与内容不能为空" }, { status: 400 });
  }
  const post = await prisma.post.findUnique({
    where: { id: body.postId },
    select: { id: true, slug: true, title: true },
  });
  if (!post) {
    return NextResponse.json({ error: "文章不存在" }, { status: 404 });
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
  return NextResponse.json(comment, { status: 201 });
}
