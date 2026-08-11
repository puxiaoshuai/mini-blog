"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

const NAV = [
  { href: "/", label: "首页" },
  { href: "/posts", label: "文章" },
  { href: "/#projects", label: "项目" },
  { href: "/tags", label: "标签" },
  { href: "/shiyu", label: "拾语" },
  { href: "/about", label: "关于我" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="group flex items-baseline gap-3">
          <span className="font-serif text-2xl font-black tracking-wide">
            大道至简
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[.3em] text-inksoft transition-colors group-hover:text-accent sm:inline">
            Puxiaoshuai.top
          </span>
        </Link>

        <nav className="hidden items-center gap-9 text-sm md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                isActive(pathname, item.href)
                  ? "font-medium text-accent"
                  : "u-link transition-colors hover:text-accent"
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/dashboard"
            className="hidden h-9 items-center gap-2 border border-ink px-4 font-mono text-xs tracking-[.15em] transition-colors hover:bg-ink hover:text-paper sm:inline-flex"
          >
            管理
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="flex h-9 w-9 items-center justify-center border border-line md:hidden"
            aria-label="菜单"
            aria-expanded={open}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col gap-4 border-t border-line bg-card px-5 py-4 text-sm md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={isActive(pathname, item.href) ? "text-accent" : ""}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/dashboard" onClick={() => setOpen(false)}>
            管理后台
          </Link>
        </nav>
      )}
    </header>
  );
}
