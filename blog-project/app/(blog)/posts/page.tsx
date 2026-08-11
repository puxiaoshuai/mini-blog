import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedPosts } from "@/lib/posts";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "文章" };

export default async function PostsPage() {
  const posts = await getPublishedPosts();

  return (
    <section className="mx-auto max-w-6xl px-5 pt-14 md:pt-20">
      <div className="mb-2 flex items-center gap-4">
        <span className="eyebrow text-[11px] text-accent">ARTICLES</span>
        <div className="h-px flex-1 bg-line" />
      </div>
      <h1 className="font-serif text-4xl font-black md:text-5xl">文章</h1>
      <p className="mt-3 text-sm text-inksoft">
        共 {posts.length} 篇 · 技术、AI 工具与日常
      </p>

      <div className="mt-10">
        {posts.length === 0 ? (
          <p className="py-16 text-center text-inksoft">还没有发布文章。</p>
        ) : (
          posts.map((post, i) => (
            <Link
              key={post.id}
              href={`/posts/${post.slug}`}
              className="group flex items-baseline gap-5 border-b border-line py-6 transition-colors hover:bg-card/50 md:gap-8"
            >
              <span className="shrink-0 font-mono text-xs text-inksoft">
                N°{String(posts.length - i).padStart(3, "0")}
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
                  {post.tags.map((t) => (
                    <Link
                      key={t.slug}
                      href={`/tags/${t.slug}`}
                      className="chip chip-soft transition-colors hover:border-accent hover:text-accent"
                    >
                      {t.name}
                    </Link>
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
    </section>
  );
}
