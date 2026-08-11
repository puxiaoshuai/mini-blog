import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedPostsPage } from "@/lib/posts";
import { formatDate } from "@/lib/utils";
import Pagination from "@/components/posts/Pagination";

export const metadata: Metadata = { title: "文章" };

// ISR：每个 ?page=N 独立缓存，60s 增量重验证
export const revalidate = 60;

const PAGE_SIZE = 20;

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const { items, total, pageSize, totalPages } = await getPublishedPostsPage({
    page,
    pageSize: PAGE_SIZE,
  });
  const startNo = total - (page - 1) * pageSize; // 本页首条全局编号

  return (
    <section className="mx-auto max-w-6xl px-5 pt-14 md:pt-20">
      <div className="mb-2 flex items-center gap-4">
        <span className="eyebrow text-[11px] text-accent">ARTICLES</span>
        <div className="h-px flex-1 bg-line" />
      </div>
      <h1 className="font-serif text-4xl font-black md:text-5xl">文章</h1>
      <p className="mt-3 text-sm text-inksoft">
        共 {total} 篇 · 技术、AI 工具与日常
      </p>

      <div className="mt-10">
        {items.length === 0 ? (
          <p className="py-16 text-center text-inksoft">还没有发布文章。</p>
        ) : (
          items.map((post, i) => (
            <Link
              key={post.id}
              href={`/posts/${post.slug}`}
              className="group flex items-baseline gap-5 border-b border-line py-6 transition-colors hover:bg-card/50 md:gap-8"
            >
              <span className="shrink-0 font-mono text-xs text-inksoft">
                N°{String(startNo - i).padStart(3, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="font-serif text-xl font-bold leading-snug transition-colors group-hover:text-accent">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="mt-1.5 truncate text-sm text-inksoft">
                    {post.excerpt}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {/* 卡片整体是 Link，内部标签用 span，避免 <a> 嵌套 <a> */}
                  {post.tags.map((t) => (
                    <span key={t.slug} className="chip chip-soft">
                      {t.name}
                    </span>
                  ))}
                  <span className="font-mono text-[11px] text-inksoft">
                    {formatDate(post.createdAt)}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} basePath="/posts" />
    </section>
  );
}
