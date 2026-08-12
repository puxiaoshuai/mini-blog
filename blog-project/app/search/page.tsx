import type { Metadata } from "next";
import Link from "next/link";
import { searchPosts } from "@/lib/posts";
import PostCard from "@/components/posts/PostCard";

export const metadata: Metadata = { title: "搜索" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const results = q.trim() ? await searchPosts(q) : [];

  return (
    <div className="mx-auto max-w-6xl px-5 pt-14 md:pt-20">
      {/* ═══ 页头 + 返回首页 ═══ */}
      <div className="flex items-end justify-between gap-6">
        <div>
          <div className="mb-2 flex items-center gap-4">
            <span className="eyebrow text-[11px] text-accent">SEARCH</span>
            <div className="h-px w-16 bg-line" />
          </div>
          <h1 className="font-serif text-4xl font-black md:text-5xl">搜索</h1>
        </div>
        <Link
          href="/"
          className="group flex h-10 shrink-0 items-center gap-2 border border-ink px-4 font-mono text-xs tracking-[.15em] transition-colors hover:bg-ink hover:text-paper"
        >
          <svg
            className="transition-transform duration-300 group-hover:-translate-x-1"
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          返回首页
        </Link>
      </div>

      {/* GET 表单：服务端渲染，无 JS 依赖 */}
      <form action="/search" method="get" className="mt-8 flex">
        <input
          name="q"
          defaultValue={q}
          placeholder="搜索文章标题、摘要或正文…"
          autoFocus
          className="h-12 flex-1 border border-line bg-card px-4 font-serif text-lg transition-colors focus:border-ink focus:outline-none"
        />
        <button className="h-12 bg-accent px-6 font-mono text-xs tracking-[.15em] text-paper transition-colors hover:bg-accentdeep">
          搜索
        </button>
      </form>

      <div className="mt-10">
        {!q.trim() ? (
          <p className="py-10 text-center font-mono text-xs text-inksoft">
            输入关键词开始搜索
          </p>
        ) : results.length === 0 ? (
          <p className="py-10 text-center font-mono text-xs text-inksoft">
            没有找到与「{q}」相关的文章
          </p>
        ) : (
          <div>
            <div className="flex items-center gap-4">
              <p className="font-mono text-[11px] text-inksoft">
                共{" "}
                <span className="font-serif font-black text-accent">
                  {results.length}
                </span>{" "}
                篇命中「{q}」
              </p>
              <div className="h-px flex-1 bg-line" />
            </div>

            {/* ═══ 结果卡片 ═══ */}
            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {results.map((p, i) => (
                <PostCard key={p.id} post={p} q={q} delay={`${i * 0.05}s`} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
