import Image from "next/image";
import Link from "next/link";
import { getPublishedPosts, getStats } from "@/lib/posts";
import { formatDate } from "@/lib/utils";
import { PROJECTS } from "@/lib/projects";

/** 首页：刊头 / 卷首诗 / 数据台账 / 最近文章 / 项目 / 订阅带 */
const STATS_LABELS = ["篇文章", "次浏览", "个标签", "条拾语"];

export default async function Home() {
  const [stats, posts] = await Promise.all([getStats(), getPublishedPosts()]);
  const statsValues = [stats.posts, stats.views, stats.tags, stats.shiyus];
  const [featured, ...rest] = posts;

  return (
    <div>
      {/* ═══ 刊头 Masthead ═══ */}
      <section className="mx-auto max-w-6xl px-5 pt-10 md:pt-14">
        <div className="flex items-end justify-between gap-6 border-y-2 border-ink py-5 md:py-7">
          <div>
            <p className="eyebrow mb-2 text-[10px] text-inksoft">
              大 道 至 简 · PUXIAOSHUAI
            </p>
            <h1 className="ink-wipe font-serif text-5xl font-black leading-none md:text-7xl">
              大道至简
            </h1>
          </div>
          <div className="text-right font-mono text-[10px] leading-loose text-inksoft md:text-[11px]">
            <p>时光是画在卷上的河流</p>
            <p>SINCE 2023 · 成都</p>
          </div>
        </div>

        {/* ═══ 卷首诗 Hero ═══ */}
        <div className="relative overflow-hidden pb-20 pt-16 text-center md:pb-28 md:pt-24">
          <p className="eyebrow reveal text-[11px] text-accent">卷首诗 · ODE</p>
          <p
            className="reveal mt-5 mb-9 font-mono text-[11px] tracking-[.3em] text-inksoft"
            style={{ animationDelay: ".08s" }}
          >
            唐 · 王维《终南别业》
          </p>
          <h2
            className="reveal font-serif text-4xl font-black leading-[1.6] md:text-6xl md:leading-[1.6]"
            style={{ animationDelay: ".16s" }}
          >
            行到水穷处，<br className="md:hidden" />
            坐看云起时。
          </h2>
          <div
            className="reveal mt-11 flex items-center justify-center gap-5"
            style={{ animationDelay: ".24s" }}
          >
            <div className="h-px w-16 bg-line md:w-28" />
            <span className="seal flex h-10 w-10 items-center justify-center bg-accent font-serif font-black text-nighttext">
              简
            </span>
            <div className="h-px w-16 bg-line md:w-28" />
          </div>
          <p
            className="reveal mt-8 font-serif text-lg text-inksoft"
            style={{ animationDelay: ".32s" }}
          >
            低谷之处，恰是云起的起点。
          </p>
        </div>
      </section>

      {/* ═══ 数据台账 ═══ */}
      <section className="mx-auto max-w-6xl px-5">
        <div className="grid grid-cols-2 border-y-2 border-ink bg-card/60 md:grid-cols-4">
          {statsValues.map((value, i) => (
            <div
              key={STATS_LABELS[i]}
              className={`py-7 px-4 text-center ${
                i < statsValues.length - 1 ? "border-r border-linesoft" : ""
              }`}
            >
              <p className="font-serif text-3xl font-black md:text-4xl">
                {value}
              </p>
              <p className="mt-1 font-mono text-[10px] tracking-[.3em] text-inksoft">
                {STATS_LABELS[i]}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ 最近文章 · 杂志卡片网格 ═══ */}
      <section id="articles" className="mx-auto mt-16 max-w-6xl px-5">
        <div className="mb-2 flex items-center gap-4">
          <h2 className="font-serif text-2xl font-black">最近文章</h2>
          <span className="pt-1 font-mono text-[10px] tracking-[.25em] text-inksoft">
            RECENT WRITING
          </span>
          <div className="h-px flex-1 bg-line" />
          <Link
            href="/posts"
            className="font-mono text-[11px] text-inksoft transition-colors hover:text-accent"
          >
            全部文章 →
          </Link>
        </div>

        {posts.length === 0 ? (
          <p className="py-16 text-center font-mono text-xs text-inksoft">
            还没有发布文章。
          </p>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {/* 精选大卡 */}
            {featured && (
              <article className="reveal group md:col-span-2">
                <Link
                  href={`/posts/${featured.slug}`}
                  className="card-raise grid h-full border border-line bg-card transition-colors hover:border-ink md:grid-cols-2"
                >
                  <div className="relative aspect-[16/9] overflow-hidden border-b border-line md:aspect-auto md:border-b-0 md:border-r">
                    {featured.coverImage ? (
                      <Image
                        src={featured.coverImage}
                        alt={featured.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-paper2">
                        <span className="chip text-ink">
                          {featured.tags[0]?.name ?? "文章"}
                        </span>
                      </div>
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-ink/10" />
                    {featured.tags[0] && (
                      <span className="chip absolute bottom-3 left-3 bg-paper/90 text-ink">
                        {featured.tags[0].name}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col justify-center gap-3 p-6 md:p-8">
                    <p className="font-mono text-[10px] tracking-[.15em] text-inksoft">
                      {formatDate(featured.createdAt)} · {featured.readingMinutes} MIN · {featured.views} 阅
                    </p>
                    <h3 className="title-hover font-serif text-2xl font-black leading-snug transition-colors group-hover:text-accent">
                      {featured.title}
                    </h3>
                    {featured.excerpt && (
                      <p className="line-clamp-2 text-sm leading-relaxed text-inksoft">
                        {featured.excerpt}
                      </p>
                    )}
                    <span className="u-link mt-1 flex w-fit items-center gap-2 font-medium text-accent">
                      阅读全文
                      <svg
                        className="transition-transform duration-300 group-hover:translate-x-1"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              </article>
            )}

            {/* 普通卡片（最多 4 张） */}
            {rest.slice(0, 4).map((post, i) => (
              <article
                key={post.id}
                className="reveal"
                style={{ animationDelay: `${(i + 1) * 0.08}s` }}
              >
                <Link
                  href={`/posts/${post.slug}`}
                  className="card-raise group block h-full border border-line bg-card transition-colors hover:border-ink"
                >
                  <div className="relative aspect-[16/9] overflow-hidden border-b border-line">
                    {post.coverImage ? (
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-paper2">
                        <span className="chip text-ink">{post.tags[0]?.name ?? "文章"}</span>
                      </div>
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-ink/10" />
                    {post.tags[0] && (
                      <span className="chip absolute bottom-3 left-3 bg-paper/90 text-ink">
                        {post.tags[0].name}
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="font-mono text-[10px] tracking-[.15em] text-inksoft">
                      {formatDate(post.createdAt)} · {post.readingMinutes} MIN · {post.views} 阅
                    </p>
                    <h3 className="title-hover mt-2 font-serif text-lg font-bold leading-snug transition-colors group-hover:text-accent">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-inksoft">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ═══ 项目 ═══ */}
      <section id="projects" className="mx-auto mt-20 max-w-6xl px-5">
        <div className="mb-2 flex items-center gap-4">
          <span className="eyebrow text-[11px] text-accent">PROJECTS</span>
          <span className="font-mono text-[10px] tracking-[.25em] text-inksoft">
            手作 · HANDMADE
          </span>
          <div className="h-px flex-1 bg-line" />
          <a href="#" className="font-mono text-[11px] text-inksoft transition-colors hover:text-accent">
            全部项目 →
          </a>
        </div>
        <h2 className="mt-3 font-serif text-2xl font-black">我的项目</h2>
        <p className="mt-2 max-w-xl text-sm text-inksoft">
          一些亲手建造的东西——有的仍在服役，有的还在打磨。每个项目都能看演示、也能翻源码。
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {PROJECTS.map((project, i) => (
            <article
              key={project.name}
              className="card-raise reveal group flex flex-col border border-line bg-card transition-colors hover:border-ink"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <a
                href="#"
                className="relative block aspect-[16/10] overflow-hidden border-b border-line"
              >
                <Image
                  src={project.image}
                  alt={project.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <span className="absolute left-3 top-3 chip bg-paper/90 text-ink transition-colors duration-300 group-hover:text-accent">
                  {project.no}
                </span>
                <span className="absolute bottom-3 right-3 bg-night px-2.5 py-1 font-mono text-[10px] tracking-[.15em] text-nighttext transition-colors duration-300 group-hover:bg-accent">
                  {project.period}
                </span>
              </a>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="title-hover font-serif text-xl font-black">{project.name}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-inksoft">
                  {project.desc}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span key={tag} className="chip chip-soft">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-6 flex items-center gap-3 border-t border-linesoft pt-4">
                  {project.demoUrl ? (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 flex-1 items-center justify-center gap-2 bg-accent font-mono text-xs tracking-[.12em] text-nighttext transition-colors hover:bg-accentdeep"
                    >
                      在线演示
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <path d="M7 17 17 7M8 7h9v9" />
                      </svg>
                    </a>
                  ) : (
                    <span className="pointer-events-none flex h-10 flex-1 items-center justify-center gap-2 bg-accent/40 font-mono text-xs tracking-[.12em] text-nighttext">
                      在线演示（待填链接）
                    </span>
                  )}
                  {project.githubUrl ? (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 flex-1 items-center justify-center gap-2 border border-ink font-mono text-xs tracking-[.12em] transition-colors hover:bg-ink hover:text-paper"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
                      </svg>
                      查看源码
                    </a>
                  ) : (
                    <span className="pointer-events-none flex h-10 flex-1 items-center justify-center gap-2 border border-ink/40 font-mono text-xs tracking-[.12em] text-inksoft/50">
                      源码（待填链接）
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ═══ 卷末信笺 ═══ */}
      <section className="mx-auto mt-20 max-w-6xl px-5">
        <div className="relative overflow-hidden border-y-2 border-ink bg-night px-6 py-16 text-center text-nighttext md:py-20">
          <div className="mx-auto flex items-center justify-center gap-5">
            <div className="h-px w-16 bg-nighttext/30 md:w-28" />
            <span className="seal flex h-10 w-10 items-center justify-center bg-accent font-serif font-black text-nighttext">
              简
            </span>
            <div className="h-px w-16 bg-nighttext/30 md:w-28" />
          </div>
          <p className="eyebrow mt-8 text-[10px] text-nighttext/60">
            卷末信笺 · COLOPHON
          </p>
          <p className="mx-auto mt-6 font-serif text-3xl font-black leading-[1.7] md:text-4xl">
            不定期更新，见字如面。
            <br />
            得闲时，随手一读。
          </p>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-nighttext/70">
            欢迎来信，聊聊 AI、技术与生活里那些值得记录的小事。
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <span className="font-mono text-[11px] tracking-[.25em] text-nighttext/60">
              来信 →
            </span>
            <a
              href="mailto:1372553910@qq.com"
              className="border border-nighttext/60 px-8 py-3.5 font-mono text-xs tracking-[.2em] transition-colors duration-300 hover:bg-nighttext hover:text-night"
            >
              1372553910@qq.com
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
