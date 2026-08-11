import { NextResponse } from "next/server";
import GithubSlugger from "github-slugger";
import { prisma } from "@/lib/db";
import { upsertTags } from "@/lib/posts";
import { requireAdmin } from "@/lib/auth";
import { revalidatePostPaths } from "@/lib/revalidate";

type PostBody = {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  published?: boolean;
  tags?: string[];
};

/** GET /api/posts — 已发布文章列表（公开） */
export async function GET() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      createdAt: true,
      tags: { select: { name: true, slug: true } },
    },
  });
  return NextResponse.json(posts);
}

/** POST /api/posts — 新建文章（ADMIN） */
export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "未登录或权限不足" }, { status: 401 });
  }

  let body: PostBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求体不是合法 JSON" }, { status: 400 });
  }

  const title = body.title?.trim();
  if (!title) {
    return NextResponse.json({ error: "标题不能为空" }, { status: 400 });
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
        coverImage: body.coverImage?.trim() || null,
        published: body.published ?? true,
        authorId: session.userId,
        tags: { connect: tagIds.map((id) => ({ id })) },
      },
    });
    const tagSlugs = (body.tags ?? []).map((t) => t.trim()).filter(Boolean);
    revalidatePostPaths(post.slug, tagSlugs);
    return NextResponse.json(post, { status: 201 });
  } catch (e) {
    if (e instanceof Error && "code" in (e as object) && (e as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "slug 已存在，请更换" }, { status: 409 });
    }
    throw e;
  }
}
