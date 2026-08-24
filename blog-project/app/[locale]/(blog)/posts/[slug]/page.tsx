import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getPostBySlug, getPublishedPostRefs, getAdjacentPosts, getPublishedComments } from "@/lib/posts";
import { renderMDX, getToc } from "@/lib/mdx";
import { formatDate } from "@/lib/utils";
import { SITE_URL } from "@/lib/site";
import { Link } from "@/i18n/navigation";
import Toc from "@/components/posts/Toc";
import CommentForm from "@/components/posts/CommentForm";
import PostInteractions from "@/components/posts/PostInteractions";

type Params = Promise<{ locale: string; slug: string }>;

// 强制动态渲染：next-intl 的 getTranslations 在静态生成（含 ISR on-demand）路径下会读
// headers()，触发 DYNAMIC_SERVER_USAGE 500。详情页改走普通 SSR，与首页/列表页一致。
export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const posts = await getPublishedPostRefs();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "posts" });
  const post = await getPostBySlug(slug);
  return {
    title: post?.title ?? t("title"),
    description: post?.excerpt ?? undefined,
    alternates: { canonical: `/${locale}/posts/${slug}` },
    openGraph: {
      title: post?.title ?? t("title"),
      description: post?.excerpt ?? undefined,
      type: "article",
      publishedTime: post?.createdAt?.toISOString(),
      ...(post?.coverImage ? { images: [post.coverImage] } : {}),
    },
  };
}

export default async function PostPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("post");
  const common = await getTranslations("common");

  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const [content, toc, { prev, next }, comments] = await Promise.all([
    renderMDX(post.content),
    Promise.resolve(getToc(post.content)),
    getAdjacentPosts(slug),
    getPublishedComments(post.id),
  ]);

  const authorName = post.author.name ?? t("authorFallback");
  const readingMinutes = post.readingMinutes;

  return (
    <div className="mx-auto max-w-6xl px-5">
      {/* 面包屑 */}
      <nav className="flex items-center gap-2 py-6 font-mono text-[11px] text-inksoft">
        <Link href="/" className="transition-colors hover:text-accent">
          {t("home")}
        </Link>
        <span>/</span>
        <Link href="/posts" className="transition-colors hover:text-accent">
          {t("posts")}
        </Link>
        <span>/</span>
        <span className="truncate text-ink">{post.title}</span>
      </nav>

      {/* JSON-LD：结构化数据（BlogPosting） */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt ?? undefined,
            datePublished: post.createdAt.toISOString(),
            dateModified: post.updatedAt.toISOString(),
            author: { "@type": "Person", name: post.author.name ?? "Leo" },
            ...(post.coverImage ? { image: post.coverImage } : {}),
          }),
        }}
      />

      <div className="grid gap-12 lg:grid-cols-12">
        {/* ═══ 正文列 ═══ */}
        <article className="min-w-0 lg:col-span-8">
          <header className="reveal">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              {post.tags.map((tag) => (
                <Link key={tag.slug} href={`/tags/${tag.slug}`} className="chip chip-accent">
                  {tag.name}
                </Link>
              ))}
              <span className="font-mono text-[11px] tracking-[.25em] text-inksoft">
                {formatDate(post.createdAt)} ·{" "}
                {common("units.minRead", { minutes: readingMinutes })}
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
                    {formatDate(post.createdAt)} · {t("updatedOn", { date: formatDate(post.updatedAt) })}
                  </p>
                </div>
              </div>
              <div className="hidden h-8 w-px bg-line sm:block" />
              <PostInteractions
                postId={post.id}
                initialLikes={post.likes}
                initialViews={post.views}
              />
            </div>
          </header>

          {/* 封面（有则显示） */}
          {post.coverImage && (
            <figure className="frame mt-8 reveal" style={{ animationDelay: ".08s" }}>
              <div className="relative aspect-[16/9] w-full overflow-hidden border border-ink/25 bg-card">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover"
                />
              </div>
            </figure>
          )}

          {/* 正文（纸感排版：宋体 + 首字下沉） */}
          <div className="prose-ink mt-4 font-serif">
            <div className="mdx-body">{content}</div>
          </div>

          {/* 标签 */}
          <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-line pt-6">
            <span className="font-mono text-[10px] tracking-[.3em] text-inksoft">
              {t("tagsLabel")}
            </span>
            {post.tags.map((tag) => (
              <Link
                key={tag.slug}
                href={`/tags/${tag.slug}`}
                className="chip transition-colors hover:border-accent hover:bg-accent hover:text-paper"
              >
                {tag.name}
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
                <span className="chip text-[10px]">{t("blogger")}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-inksoft">
                {t("authorDesc")}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                <Link href="/about" className="u-link text-accent">
                  {t("aboutLink")}
                </Link>
                <Link href="/posts" className="u-link">
                  {t("allPosts")}
                </Link>
                <a href={`${SITE_URL}/`} className="u-link">
                  {t("archiveLink")}
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
                  {t("prev")}
                </p>
                <p className="font-serif font-bold leading-snug transition-colors group-hover:text-accent">
                  {prev.title}
                </p>
              </Link>
            ) : (
              <div className="pointer-events-none border border-line bg-card p-5 opacity-40">
                <p className="mb-2 font-mono text-[10px] tracking-[.25em] text-inksoft">
                  {t("prev")}
                </p>
                <p className="font-serif font-bold leading-snug">
                  {t("prevNone")}
                </p>
              </div>
            )}
            {next ? (
              <Link
                href={`/posts/${next.slug}`}
                className="group border border-line bg-card p-5 text-right transition-colors hover:border-ink"
              >
                <p className="mb-2 font-mono text-[10px] tracking-[.25em] text-inksoft">
                  {t("next")}
                </p>
                <p className="font-serif font-bold leading-snug transition-colors group-hover:text-accent">
                  {next.title}
                </p>
              </Link>
            ) : (
              <div className="pointer-events-none border border-line bg-card p-5 text-right opacity-40">
                <p className="mb-2 font-mono text-[10px] tracking-[.25em] text-inksoft">
                  {t("next")}
                </p>
                <p className="font-serif font-bold leading-snug">
                  {t("nextNone")}
                </p>
              </div>
            )}
          </nav>

          {/* 评论区 */}
          <section className="mt-14">
            <div className="mb-6 flex items-center gap-3">
              <h2 className="font-serif text-xl font-black">{t("commentsTitle")}</h2>
              <span className="pt-1 font-mono text-[10px] tracking-[.25em] text-inksoft">
                {t("commentsMeta", { count: comments.length })}
              </span>
              <div className="h-px flex-1 bg-line" />
            </div>

            {comments.length > 0 && (
              <ul className="space-y-4">
                {comments.map((c) => (
                  <li key={c.id} className="border border-line bg-card p-5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage font-serif font-black text-paper">
                        {(c.author.name ?? t("anonInitial"))[0]}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{c.author.name ?? t("anonymous")}</p>
                        <p className="font-mono text-[10px] text-inksoft">{formatDate(c.createdAt)}</p>
                      </div>
                    </div>
                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink/90">{c.content}</p>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-6 border border-line bg-card p-5">
              <p className="font-serif text-base font-black">{t("writeComment")}</p>
              <CommentForm postId={post.id} />
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
