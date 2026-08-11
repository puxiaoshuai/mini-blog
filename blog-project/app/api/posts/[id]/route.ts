import { NextResponse } from "next/server";
import GithubSlugger from "github-slugger";
import { prisma } from "@/lib/db";
import { upsertTags } from "@/lib/posts";
import { requireAdmin } from "@/lib/auth";
import { revalidatePostPaths } from "@/lib/revalidate";

type Ctx = { params: Promise<{ id: string }> };

type PostBody = {
  title?: string;
  slug?: string;
  excerpt?: string | null;
  content?: string;
  coverImage?: string | null;
  published?: boolean;
  tags?: string[];
};

/** GET /api/posts/[id] — 文章详情（公开，仅已发布） */
export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const post = await prisma.post.findFirst({
    where: { id, published: true },
    include: { tags: { select: { name: true, slug: true } } },
  });
  if (!post) return NextResponse.json({ error: "文章不存在" }, { status: 404 });
  return NextResponse.json(post);
}

/** PUT /api/posts/[id] — 更新文章（ADMIN） */
export async function PUT(request: Request, ctx: Ctx) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "未登录或权限不足" }, { status: 401 });
  }
  const { id } = await ctx.params;

  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "文章不存在" }, { status: 404 });

  let body: PostBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求体不是合法 JSON" }, { status: 400 });
  }

  if ("title" in body && !body.title?.trim()) {
    return NextResponse.json({ error: "标题不能为空" }, { status: 400 });
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
    return NextResponse.json(post);
  } catch (e) {
    if (e instanceof Error && (e as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "slug 已存在，请更换" }, { status: 409 });
    }
    throw e;
  }
}

/** DELETE /api/posts/[id] — 删除文章（ADMIN） */
export async function DELETE(_req: Request, ctx: Ctx) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "未登录或权限不足" }, { status: 401 });
  }
  const { id } = await ctx.params;

  const existing = await prisma.post.findUnique({
    where: { id },
    include: { tags: { select: { slug: true } } },
  });
  if (!existing) return NextResponse.json({ error: "文章不存在" }, { status: 404 });

  await prisma.post.delete({ where: { id } });
  revalidatePostPaths(existing.slug, existing.tags.map((t) => t.slug));
  return NextResponse.json({ ok: true });
}
