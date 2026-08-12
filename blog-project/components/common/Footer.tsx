import Link from "next/link";

const NAV = [
  { href: "/posts", label: "文章" },
  { href: "/shiyu", label: "拾语" },
  { href: "/tags", label: "标签" },
  { href: "/about", label: "关于我" },
];

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-line">
      <div className="mx-auto max-w-6xl px-5">
        {/* ═══ 品牌 + 简洁导航 ═══ */}
        <div className="flex flex-col gap-10 py-14 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-2xl font-black">大道至简</span>
              <span className="font-mono text-[10px] uppercase tracking-[.3em] text-inksoft">
                Puxiaoshuai.top
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-inksoft">
              时光是画在卷上的河流。一个记录 AI、技术、设计日常与随手拾语的独立博客。
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-x-7 gap-y-3 text-sm">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="u-link transition-colors hover:text-accent"
              >
                {item.label}
              </Link>
            ))}
            <a
              href="mailto:1372553910@qq.com"
              className="u-link transition-colors hover:text-accent"
            >
              来信
            </a>
          </nav>
        </div>

        {/* ═══ 版权行 ═══ */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-linesoft py-5 font-mono text-[10px] tracking-[.2em] text-inksoft md:flex-row">
          <p>© 2026 大道至简 · 蜀ICP备2023037065号</p>
          <p>DESIGNED LIKE A PRINTED JOURNAL — POWERED BY NEXT.JS · TAILWIND · MDX</p>
        </div>
      </div>
    </footer>
  );
}
