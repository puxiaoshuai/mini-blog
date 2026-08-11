import Link from "next/link";
import { getPublishedPosts, getStats } from "@/lib/posts";
import { formatDate } from "@/lib/utils";

/** 首页：刊头 / 卷首诗 / 数据台账 / 最近文章 / 项目 / 订阅带 */
const STATS_LABELS = ["篇文章", "次浏览", "个标签", "条拾语"];

/** 项目板块（占位）：真实项目名/简介/演示/源码链接待用户提供 */
const PROJECTS = [
  {
    no: "PROJECT N°01",
    period: "2024 — 至今",
    name: "墨笺 · InkNote",
    desc: "一款极简的 Markdown 笔记应用。离线优先，毫秒级全文搜索，支持双向链接与思维导图预览，数据以 SQLite 本地存储。",
    tags: ["Next.js", "Tailwind", "Prisma"],
    image:
      "https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=900&auto=format&fit=crop",
  },
  {
    no: "PROJECT N°02",
    period: "2023 — 2025",
    name: "诗笺 · Shijian CLI",
    desc: "在终端里为代码与文字排版的命令行工具。支持中英混排、语法高亮与「纸感」主题输出，让 CLI 也读起来像一首诗。",
    tags: ["Rust", "CLI", "Nushell"],
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=900&auto=format&fit=crop",
  },
  {
    no: "PROJECT N°03",
    period: "迁移中",
    name: "大道至简 · 本站",
    desc: "你正在看的这个博客。原 WordPress（Qzdy 主题）迁移至 Next.js + MDX + Prisma，纸感编辑风格，代码开源。",
    tags: ["Next.js", "MDX", "Prisma", "Tailwind"],
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=900&auto=format&fit=crop",
  },
];

export default async function Home() {
  const [stats, posts] = await Promise.all([getStats(), getPublishedPosts()]);
  const statsValues = [stats.posts, stats.views, stats.tags, stats.shiyus];

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

      {/* ═══ 最近文章 ═══ */}
      <section className="mx-auto mt-16 max-w-6xl px-5">
        <div className="mb-2 flex items-center gap-4">
          <h2 className="font-serif text-2xl font-bold">最近文章</h2>
          <div className="h-px flex-1 bg-line" />
          <Link
            href="/posts"
            className="u-link font-mono text-xs tracking-[.2em] text-inksoft hover:text-accent"
          >
            ALL →
          </Link>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {posts.slice(0, 4).map((post) => (
            <Link
              key={post.id}
              href={`/posts/${post.slug}`}
              className="group flex flex-col justify-between gap-8 border border-line bg-card p-5 transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0_0_rgb(var(--c-ink)/.12)]"
            >
              <div>
                {post.tags[0] && (
                  <span className="chip chip-accent">{post.tags[0].name}</span>
                )}
                <h3 className="mt-3 font-serif text-lg font-bold leading-snug transition-colors group-hover:text-accent">
                  {post.title}
                </h3>
              </div>
              <p className="font-mono text-[11px] text-inksoft">
                {formatDate(post.createdAt)}
              </p>
            </Link>
          ))}
        </div>
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
              className="card-raise reveal flex flex-col border border-line bg-card transition-colors hover:border-ink"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <a
                href="#"
                className="group relative block aspect-[16/10] overflow-hidden border-b border-line"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.image}
                  alt={project.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <span className="absolute left-3 top-3 chip bg-paper/90 text-ink">
                  {project.no}
                </span>
                <span className="absolute bottom-3 right-3 bg-night px-2.5 py-1 font-mono text-[10px] tracking-[.15em] text-nighttext">
                  {project.period}
                </span>
              </a>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-serif text-xl font-black">{project.name}</h3>
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
                  <a
                    href="#"
                    className="flex h-10 flex-1 items-center justify-center gap-2 bg-accent font-mono text-xs tracking-[.12em] text-nighttext transition-colors hover:bg-accentdeep"
                  >
                    在线演示
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <path d="M7 17 17 7M8 7h9v9" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="flex h-10 flex-1 items-center justify-center gap-2 border border-ink font-mono text-xs tracking-[.12em] transition-colors hover:bg-ink hover:text-paper"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
                    </svg>
                    查看源码
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ═══ 订阅带 ═══ */}
      <section className="mx-auto mt-20 max-w-6xl px-5">
        <div className="flex flex-col items-center justify-between gap-6 bg-night px-8 py-12 text-center text-nighttext md:flex-row md:text-left">
          <div>
            <p className="eyebrow text-[10px] text-nighttext/70">NEWSLETTER</p>
            <p className="mt-3 font-serif text-2xl font-bold">
              不定期更新，随手一读。
            </p>
          </div>
          <Link
            href="mailto:1372553910@qq.com"
            className="border border-nighttext/60 px-6 py-3 font-mono text-xs tracking-[.15em] transition-colors hover:bg-nighttext hover:text-night"
          >
            来信 → 1372553910@qq.com
          </Link>
        </div>
      </section>
    </div>
  );
}
