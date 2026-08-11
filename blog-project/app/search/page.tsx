import type { Metadata } from "next";
import Link from "next/link";
import { searchPosts } from "@/lib/posts";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "搜索" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const results = q.trim() ? await searchPosts(q) : [];

  return (
    <div className="mx-auto max-w-4xl px-5 pt-14 md:pt-20">
      <div className="mb-2 flex items-center gap-4">
        <span className="eyebrow text-[11px] text-accent">SEARCH</span>
        <div className="h-px flex-1 bg-line" />
      </div>
      <h1 className="font-serif text-4xl font-black md:text-5xl">搜索</h1>

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
            <p className="font-mono text-[11px] text-inksoft">
              共 {results.length} 篇命中「{q}」
            </p>
            <div className="mt-4">
              {results.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/posts/${p.slug}`}
                  className="group flex items-baseline gap-5 border-b border-line py-6 transition-colors hover:bg-card/50"
                >
                  <span className="shrink-0 font-mono text-xs text-inksoft">
                    N°{String(results.length - i).padStart(3, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-serif text-xl font-bold leading-snug transition-colors group-hover:text-accent">
                      {p.title}
                    </h2>
                    {p.excerpt && (
                      <p className="mt-1.5 line-clamp-2 text-sm text-inksoft">
                        {p.excerpt}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      {p.tags.map((t) => (
                        <span key={t.slug} className="chip chip-soft">
                          {t.name}
                        </span>
                      ))}
                      <span className="font-mono text-[11px] text-inksoft">
                        {formatDate(p.createdAt)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
