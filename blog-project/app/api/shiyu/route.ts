import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getShiyus, getNextShiyuNo, toShiyuItem } from "@/lib/shiyu";
import { requireAdmin } from "@/lib/auth";

/** GET /api/shiyu?page=1&pageSize=10 — 拾语流（公开，置顶优先 + 时间倒序 + 分页） */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const page = Math.max(1, Number(sp.get("page")) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(sp.get("pageSize")) || 10));
  return NextResponse.json(await getShiyus({ page, pageSize }));
}

/** POST /api/shiyu — 新建拾语（ADMIN） */
export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "未登录或权限不足" }, { status: 401 });
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

  const content = body.content?.trim();
  if (!content) {
    return NextResponse.json({ error: "内容不能为空" }, { status: 400 });
  }

  const shiyu = await prisma.shiyu.create({
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

  return NextResponse.json(toShiyuItem(shiyu), { status: 201 });
}
