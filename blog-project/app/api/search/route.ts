import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { searchPosts } from "@/lib/posts";

/** GET /api/search?q= — 全文搜索（公开，返回 JSON 结果） */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const results = await searchPosts(q);
  return NextResponse.json({ query: q, results });
}
