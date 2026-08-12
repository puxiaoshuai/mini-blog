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

  return (
    <section className="mx-auto max-w-6xl px-5 pt-14 md:pt-20">
      <div className="mb-2 flex items-center gap-4">
        <span className="eyebrow text-[11px] text-accent">ARTICLES</span>
        <div className="h-px flex-1 bg-line" />
      </div>
      <h1 className="font-serif text-4xl font-black md:text-5xl">文章</h1>
      <p className="mt-3 text-sm text-inksoft">
        共{" "}
        <span className="font-serif font-black text-accent">{total}</span>{" "}
        篇 · 技术、AI 工具与日常
      </p>

      <div className="mt-10">
        {items.length === 0 ? (
          <p className="py-16 text-center text-inksoft">还没有发布文章。</p>
        ) : (
          items.map((post) => (
            <Link
              key={post.id}
              href={`/posts/${post.slug}`}
              className="group relative grid gap-2.5 border-b border-line py-7 transition-colors hover:bg-card/40 md:grid-cols-[1fr_10rem] md:items-start md:gap-6 md:py-8 md:px-4"
            >
              {/* 移动端日期（桌面端在右侧 meta） */}
              <span className="font-mono text-[11px] text-inksoft md:hidden">
                {formatDate(post.createdAt)}
              </span>

              {/* 主体 */}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {post.tags.map((t) => (
                    <span key={t.slug} className="chip chip-soft">
                      {t.name}
                    </span>
                  ))}
                </div>
                <h2 className="title-hover mt-3 font-serif text-xl font-black leading-snug md:text-2xl">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="mt-2.5 line-clamp-2 max-w-2xl text-sm leading-relaxed text-inksoft">
                    {post.excerpt}
                  </p>
                )}
              </div>

              {/* 右侧 meta */}
              <div className="flex items-center justify-between gap-4 md:flex-col md:items-end md:gap-2 md:text-right">
                <span className="hidden font-mono text-[11px] text-inksoft md:block">
                  {formatDate(post.createdAt)}
                </span>
                <span className="font-mono text-[11px] text-inksoft">
                  {post.readingMinutes} MIN
                </span>
                <span className="font-mono text-[11px] text-inksoft">
                  {post.views} 阅
                </span>
                <span className="hidden items-center gap-1.5 font-mono text-[11px] text-accent opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100 md:inline-flex">
                  阅读
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          ))
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} basePath="/posts" />
    </section>
  );
}
