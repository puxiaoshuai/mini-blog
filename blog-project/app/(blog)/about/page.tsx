import type { Metadata } from "next";

export const metadata: Metadata = { title: "关于我" };

/** 技术栈分组 · 静态数据，直接在此维护 */
const SKILL_GROUPS: { group: string; en: string; items: [string, string][] }[] = [
  {
    group: "前端",
    en: "FRONTEND",
    items: [
      ["TypeScript", "主力"],
      ["React", "主力"],
      ["Next.js", "常用"],
      ["TailwindCSS", "常用"],
    ],
  },
  {
    group: "后端",
    en: "BACKEND",
    items: [
      ["Node.js", "主力"],
      ["Express / Hono.js", "常用"],
      ["REST / WebSocket", "常用"],
    ],
  },
  {
    group: "数据",
    en: "DATA",
    items: [
      ["Prisma", "常用"],
      ["PostgreSQL", "常用"],
      ["SQLite", "常用"],
    ],
  },
  {
    group: "工程",
    en: "ENGINEERING",
    items: [
      ["Git", "主力"],
      ["pnpm / Monorepo", "常用"],
      ["Docker", "接触"],
    ],
  },
  {
    group: "AI 工具",
    en: "AI TOOLS",
    items: [
      ["Claude Code", "主力"],
      ["Prompt 工程", "常用"],
      ["Cline", "常用"],
    ],
  },
];

/** 基本信息 */
const BASIC_INFO: [string, string][] = [
  ["姓名 / NAME", "Leo · puxiaoshuai"],
  ["坐标 / BASE", "中国 · 成都"],
  ["角色 / ROLE", "TypeScript 全栈工程师"],
  ["邮箱 / MAIL", "1372553910@qq.com"],
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-5">
      {/* ═══ 页头 ═══ */}
      <section className="border-b-2 border-ink pb-10 pt-12 md:pt-16">
        <p className="eyebrow text-[11px] text-accent">关于我 · ABOUT</p>
        <h1 className="mt-4 font-serif text-4xl font-black leading-tight md:text-5xl">
          一个 TypeScript 全栈程序员
        </h1>
        <p className="mt-5 max-w-2xl font-serif text-lg leading-relaxed text-inksoft md:text-xl">
          白天写前后端，晚上折腾 AI 工具与自动化。相信大道至简：准确、克制、有余韵。
        </p>
      </section>

      {/* ═══ 个人简介 ═══ */}
      <section className="mt-12">
        <div className="mb-6 flex items-center gap-4">
          <h2 className="font-serif text-2xl font-black">个人简介</h2>
          <span className="pt-1 font-mono text-[10px] tracking-[.25em] text-inksoft">
            BIO
          </span>
          <div className="h-px flex-1 bg-line" />
        </div>

        <div className="space-y-5 font-serif text-[15px] leading-loose text-inksoft">
          <p>
            你好，我是<span className="text-ink">Leo</span>
            。TypeScript
            贯穿我的工作流：React / Next.js
            的前端界面、Node.js 的接口与数据层、Prisma 的建模，尽量让类型成为团队的「合同」。
          </p>
          <p>
            从 WordPress 时代开始写博客，攒了几年的日记、拾语与技术笔记。如今正把它迁到
            Next.js + MDX + Prisma 上，也就是你正在看的这个站。顺手还在研究
            Claude Code 的 skills 与 command，想让 AI 更好地接手重复劳动。
          </p>
          <p>
            如果你在找一个能聊 TS 全栈、也聊工具审美的同类，欢迎来信。
          </p>
        </div>

        {/* 基本信息 */}
        <ul className="mt-8 grid gap-x-8 gap-y-3 border-t border-lineSoft pt-6 font-mono text-[11px] sm:grid-cols-2">
          {BASIC_INFO.map(([label, value]) => (
            <li key={label} className="flex items-baseline justify-between gap-4">
              <span className="tracking-[.15em] text-inksoft">{label}</span>
              <span className="text-right text-ink">{value}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ═══ 技术栈 ═══ */}
      <section className="mt-16">
        <div className="mb-6 flex items-center gap-4">
          <h2 className="font-serif text-2xl font-black">技术栈</h2>
          <span className="pt-1 font-mono text-[10px] tracking-[.25em] text-inksoft">
            SKILLS
          </span>
          <div className="h-px flex-1 bg-line" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SKILL_GROUPS.map((g) => (
            <div
              key={g.group}
              className="border border-line bg-card p-5 transition-colors hover:border-ink"
            >
              <p className="eyebrow text-[10px] text-inksoft">
                {g.group} · {g.en}
              </p>
              <ul className="mt-4 divide-y divide-linesoft">
                {g.items.map(([name, note]) => (
                  <li
                    key={name}
                    className="flex items-baseline justify-between gap-3 py-2"
                  >
                    <span className="font-serif text-[15px] font-bold">{name}</span>
                    <span className="font-mono text-[10px] tracking-[.15em] text-inksoft">
                      {note}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ 联系 ═══ */}
      <section className="mb-20 mt-16">
        <div className="mb-6 flex items-center gap-4">
          <h2 className="font-serif text-2xl font-black">联系</h2>
          <span className="pt-1 font-mono text-[10px] tracking-[.25em] text-inksoft">
            CONTACT
          </span>
          <div className="h-px flex-1 bg-line" />
        </div>

        <ul className="grid gap-4 sm:grid-cols-3">
          <li>
            <a
              href="mailto:1372553910@qq.com"
              className="card-raise block border border-line bg-card p-5 text-center transition-colors hover:border-ink"
            >
              <p className="font-serif text-lg font-black transition-colors hover:text-accent">
                QQ 邮箱
              </p>
              <p className="mt-2 font-mono text-[10px] text-inksoft">
                1372553910@qq.com
              </p>
            </a>
          </li>
          <li>
            <a
              href="https://github.com/puxiaoshuai"
              target="_blank"
              rel="noreferrer"
              className="card-raise block border border-line bg-card p-5 text-center transition-colors hover:border-ink"
            >
              <p className="font-serif text-lg font-black transition-colors hover:text-accent">
                GitHub
              </p>
              <p className="mt-2 font-mono text-[10px] text-inksoft">@puxiaoshuai</p>
            </a>
          </li>
          <li>
            <div className="card-raise block border border-line bg-card p-5 text-center transition-colors hover:border-ink">
              <p className="font-serif text-lg font-black">微信</p>
              <p className="mt-2 font-mono text-[10px] text-inksoft">puxiaoshuaizz</p>
            </div>
          </li>
        </ul>
      </section>
    </div>
  );
}
