"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";

const NAV = [
  {
    href: "/dashboard",
    label: "概览",
    en: "OVERVIEW",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    href: "/dashboard/posts",
    label: "文章",
    en: "POSTS",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M9 13h6M9 17h4" />
      </svg>
    ),
  },
  {
    href: "/dashboard/shiyu",
    label: "拾语",
    en: "SHIYU",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/comments",
    label: "评论",
    en: "COMMENTS",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/tags",
    label: "标签",
    en: "TAGS",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M20.6 13.4 10.8 3.6 3 3l.6 7.8 9.8 9.8a2 2 0 0 0 2.8 0l4.4-4.4a2 2 0 0 0 0-2.8Z" />
        <circle cx="7.5" cy="7.5" r="1" fill="currentColor" />
      </svg>
    ),
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}

export default function AdminShell({
  user,
  children,
}: {
  user: { name?: string | null; email?: string | null };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const name = user.name ?? "管理员";
  const initial = name[0] ?? "管";

  return (
    <div className="min-h-screen lg:flex">
      {/* ═══ 侧边栏（深墨）═══ */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-ink text-paper lg:flex">
        <div className="border-b border-paper/10 px-6 pb-5 pt-7">
          <p className="font-serif text-2xl font-black tracking-wide">大道至简</p>
          <p className="mt-1 font-mono text-[9px] uppercase tracking-[.3em] text-paper/40">
            Admin · Console
          </p>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-6">
          <p className="px-3 pb-3 font-mono text-[9px] tracking-[.3em] text-paper/35">
            内容 / CONTENT
          </p>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-none border-l-2 px-4 py-2.5 text-sm transition-all ${
                isActive(pathname, item.href)
                  ? "border-l-accent bg-accent/15 text-paper"
                  : "border-l-transparent text-paper/60 hover:bg-paper/5 hover:text-paper"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              <span className="ml-auto font-mono text-[9px] tracking-[.15em] text-paper/35">
                {item.en}
              </span>
            </Link>
          ))}
        </nav>

        <div className="border-t border-paper/10 px-4 py-5">
          <div className="flex items-center gap-3 px-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent font-serif font-black text-paper">
              {initial}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{name}</p>
              <p className="font-mono text-[9px] text-paper/40">管理员 · ADMIN</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              title="退出登录"
              className="ml-auto text-paper/40 transition-colors hover:text-paper"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="m16 17 5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
            </button>
          </div>
          <Link
            href="/"
            className="mt-4 block border border-paper/20 py-2 text-center font-mono text-[10px] tracking-[.2em] text-paper/70 transition-colors hover:border-paper hover:text-paper"
          >
            返回前台 ↗
          </Link>
        </div>
      </aside>

      {/* ═══ 移动端顶栏 ═══ */}
      <div className="sticky top-0 z-50 flex h-14 w-full items-center justify-between bg-ink px-5 text-paper lg:hidden">
        <span className="font-serif text-xl font-black">大道至简</span>
        <Link href="/" className="font-mono text-[10px] tracking-[.2em] text-paper/70">
          返回前台 ↗
        </Link>
      </div>

      {/* ═══ 主内容区 ═══ */}
      <div className="min-w-0 flex-1">
        {/* 移动端横排导航 */}
        <nav className="flex gap-1 overflow-x-auto border-b border-line bg-card px-4 py-2 lg:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 px-3 py-1.5 font-mono text-[11px] tracking-[.1em] ${
                isActive(pathname, item.href)
                  ? "bg-night text-nighttext"
                  : "text-inksoft"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="shrink-0 px-3 py-1.5 font-mono text-[11px] tracking-[.1em] text-accent"
          >
            退出
          </button>
        </nav>

        <main className="mx-auto max-w-6xl px-5 pb-16 pt-6 md:px-10 lg:pt-10">
          {children}
        </main>
      </div>
    </div>
  );
}
