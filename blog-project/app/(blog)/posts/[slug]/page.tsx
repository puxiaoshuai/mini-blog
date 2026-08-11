import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getPublishedPosts, getAdjacentPosts } from "@/lib/posts";
import { renderMDX, getToc } from "@/lib/mdx";
import { formatDate } from "@/lib/utils";
import Toc from "@/components/posts/Toc";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  return {
    title: post?.title ?? "文章",
    description: post?.excerpt ?? undefined,
  };
}

export default async function PostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const [content, toc, { prev, next }] = await Promise.all([
    renderMDX(post.content),
    Promise.resolve(getToc(post.content)),
    getAdjacentPosts(slug),
  ]);

  const authorName = post.author.name ?? "博主";
  const readingMinutes = Math.max(1, Math.round(post.content.length / 400));

  return (
    <div className="mx-auto max-w-6xl px-5">
      {/* 面包屑 */}
      <nav className="flex items-center gap-2 py-6 font-mono text-[11px] text-inksoft">
        <Link href="/" className="transition-colors hover:text-accent">
          首页
        </Link>
        <span>/</span>
        <Link href="/posts" className="transition-colors hover:text-accent">
          文章
        </Link>
        <span>/</span>
        <span className="truncate text-ink">{post.title}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-12">
        {/* ═══ 正文列 ═══ */}
        <article className="min-w-0 lg:col-span-8">
          <header className="reveal">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              {post.tags.map((t) => (
                <Link key={t.slug} href={`/tags/${t.slug}`} className="chip chip-accent">
                  {t.name}
                </Link>
              ))}
              <span className="font-mono text-[11px] tracking-[.25em] text-inksoft">
                {formatDate(post.createdAt)} · {readingMinutes} 分钟阅读
              </span>
            </div>
            <h1 className="font-serif text-3xl font-black leading-[1.2] md:text-[2.7rem]">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="mt-5 text-lg leading-loose text-inksoft">
                {post.excerpt}
              </p>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-line pb-7">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent font-serif font-black text-paper">
                  {authorName[0]}
                </span>
                <div>
                  <p className="text-sm font-medium leading-tight">{authorName}</p>
                  <p className="font-mono text-[10px] text-inksoft">
                    {formatDate(post.createdAt)} · 更新于{" "}
                    {formatDate(post.updatedAt)}
                  </p>
                </div>
              </div>
              <div className="hidden h-8 w-px bg-line sm:block" />
              <div className="flex items-center gap-2 font-mono text-xs text-inksoft">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden
                >
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                {post.views} 次浏览
              </div>
            </div>
          </header>

          {/* 封面（有则显示） */}
          {post.coverImage && (
            <figure className="frame mt-8 reveal" style={{ animationDelay: ".08s" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full border border-ink/25"
              />
            </figure>
          )}

          {/* 正文（纸感排版：宋体 + 首字下沉） */}
          <div className="prose-ink mt-4 font-serif">
            <div className="mdx-body">{content}</div>
          </div>

          {/* 标签 */}
          <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-line pt-6">
            <span className="font-mono text-[10px] tracking-[.3em] text-inksoft">
              标签 / TAGS
            </span>
            {post.tags.map((t) => (
              <Link
                key={t.slug}
                href={`/tags/${t.slug}`}
                className="chip transition-colors hover:border-accent hover:bg-accent hover:text-paper"
              >
                {t.name}
              </Link>
            ))}
          </div>

          {/* 作者卡 */}
          <div className="mt-10 flex flex-col gap-5 border border-line bg-card p-6 sm:flex-row">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent font-serif text-xl font-black text-paper">
              {authorName[0]}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="font-serif text-lg font-black">{authorName}</h3>
                <span className="chip text-[10px]">博主</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-inksoft">
                独立开发者 / Blogger，原博客「大道至简」维护者。正在把 WordPress
                上攒了几年的文章与拾语迁移到 Next.js。
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                <Link href="/about" className="u-link text-accent">
                  关于我
                </Link>
                <Link href="/posts" className="u-link">
                  全部文章
                </Link>
                <a href="https://www.puxiaoshuai.top/" className="u-link">
                  旧站存档
                </a>
              </div>
            </div>
          </div>

          {/* 上一篇 / 下一篇 */}
          <nav className="mt-8 grid gap-4 sm:grid-cols-2">
            {prev ? (
              <Link
                href={`/posts/${prev.slug}`}
                className="group border border-line bg-card p-5 transition-colors hover:border-ink"
              >
                <p className="mb-2 font-mono text-[10px] tracking-[.25em] text-inksoft">
                  ← 上一篇
                </p>
                <p className="font-serif font-bold leading-snug transition-colors group-hover:text-accent">
                  {prev.title}
                </p>
              </Link>
            ) : (
              <div className="pointer-events-none border border-line bg-card p-5 opacity-40">
                <p className="mb-2 font-mono text-[10px] tracking-[.25em] text-inksoft">
                  ← 上一篇
                </p>
                <p className="font-serif font-bold leading-snug">
                  没有了，已经是最新文章
                </p>
              </div>
            )}
            {next ? (
              <Link
                href={`/posts/${next.slug}`}
                className="group border border-line bg-card p-5 text-right transition-colors hover:border-ink"
              >
                <p className="mb-2 font-mono text-[10px] tracking-[.25em] text-inksoft">
                  下一篇 →
                </p>
                <p className="font-serif font-bold leading-snug transition-colors group-hover:text-accent">
                  {next.title}
                </p>
              </Link>
            ) : (
              <div className="pointer-events-none border border-line bg-card p-5 text-right opacity-40">
                <p className="mb-2 font-mono text-[10px] tracking-[.25em] text-inksoft">
                  下一篇 →
                </p>
                <p className="font-serif font-bold leading-snug">
                  没有了，已经是最老文章
                </p>
              </div>
            )}
          </nav>

          {/* 评论区（M4 接入） */}
          <section className="mt-14">
            <div className="mb-6 flex items-center gap-3">
              <h2 className="font-serif text-xl font-black">读者留言</h2>
              <span className="pt-1 font-mono text-[10px] tracking-[.25em] text-inksoft">
                COMMENTS
              </span>
              <div className="h-px flex-1 bg-line" />
            </div>
            <div className="border border-line bg-card p-4">
              <p className="py-2 text-center text-sm text-inksoft">
                评论区将在管理端完成后开放（M4）。
              </p>
            </div>
          </section>
        </article>

        {/* ═══ 侧栏目录 ═══ */}
        <aside className="hidden lg:col-span-4 lg:block">
          <div className="sticky top-24">
            <Toc items={toc} />
          </div>
        </aside>
      </div>
    </div>
  );
}
