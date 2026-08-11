import Link from "next/link";

const SECTIONS = [
  { label: "我的日记", href: "/posts" },
  { label: "技术笔记", href: "/posts" },
  { label: "拾语", href: "/shiyu" },
  { label: "关于我", href: "/about" },
];

const ARCHIVE = [
  { label: "2026 年 08 月 · 2 篇", href: "/posts" },
  { label: "2026 年 07 月 · 2 篇", href: "/posts" },
  { label: "2026 年 03 月 · 3 篇", href: "/posts" },
  { label: "2026 年 02 月 · 2 篇", href: "/posts" },
];

const CHAT = [
  { label: "QQ 邮箱", href: "mailto:1372553910@qq.com" },
  { label: "旧站存档", href: "https://www.puxiaoshuai.top/" },
];

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-2xl font-black">大道至简</span>
            <span className="font-mono text-[10px] uppercase tracking-[.3em] text-inksoft">
              Puxiaoshuai.top
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-inksoft">
            时光是画在卷上的河流。一个记录 AI、技术、设计日常与随手拾语的独立博客。
          </p>
          <p className="mt-6 font-mono text-[11px] text-inksoft">
            © 2026 大道至简 · 蜀ICP备2023037065号
          </p>
        </div>

        <div className="md:col-span-2">
          <p className="mb-4 font-mono text-[10px] tracking-[.3em] text-inksoft">
            栏目 / SECTIONS
          </p>
          <ul className="space-y-2.5 text-sm">
            {SECTIONS.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="u-link">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3">
          <p className="mb-4 font-mono text-[10px] tracking-[.3em] text-inksoft">
            归档 / ARCHIVE
          </p>
          <ul className="space-y-2.5 font-mono text-sm text-inksoft">
            {ARCHIVE.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="u-link text-ink transition-colors hover:text-accent"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <p className="mb-4 font-mono text-[10px] tracking-[.3em] text-inksoft">
            闲谈 / CHAT
          </p>
          <ul className="space-y-2.5 text-sm">
            {CHAT.map((item) => (
              <li key={item.label}>
                <a href={item.href} className="u-link">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-linesoft">
        <p className="mx-auto max-w-6xl px-5 py-4 font-mono text-[10px] tracking-[.2em] text-inksoft">
          DESIGNED LIKE A PRINTED JOURNAL — POWERED BY NEXT.JS · TAILWIND · MDX
        </p>
      </div>
    </footer>
  );
}
