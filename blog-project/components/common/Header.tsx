"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname, Link } from "@/i18n/navigation";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";

const NAV_KEYS = [
  { href: "/", key: "home" },
  { href: "/posts", key: "posts" },
  { href: "/#projects", key: "projects" },
  { href: "/tags", key: "tags" },
  { href: "/shiyu", key: "shiyu" },
  { href: "/about", key: "about" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export default function Header() {
  const pathname = usePathname();
  const t = useTranslations("common");
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="group flex items-baseline gap-3">
          <span className="font-serif text-2xl font-black tracking-wide">
            {t("siteName")}
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[.3em] text-inksoft transition-colors group-hover:text-accent sm:inline">
            Puxiaoshuai.top
          </span>
        </Link>

        <nav className="hidden items-center gap-9 text-sm md:flex">
          {NAV_KEYS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                isActive(pathname, item.href)
                  ? "font-medium text-accent"
                  : "u-link transition-colors hover:text-accent"
              }
            >
              {t(`nav.${item.key}`)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <LanguageToggle />
          <Link
            href="/search"
            title={t("search")}
            aria-label={t("search")}
            className="hidden h-9 w-9 items-center justify-center border border-line transition-colors hover:border-ink hover:bg-card sm:flex"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="flex h-9 w-9 items-center justify-center border border-line md:hidden"
            aria-label={t("menu")}
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
          {NAV_KEYS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={isActive(pathname, item.href) ? "text-accent" : ""}
            >
              {t(`nav.${item.key}`)}
            </Link>
          ))}
          <Link href="/search" onClick={() => setOpen(false)}>
            {t("search")}
          </Link>
        </nav>
      )}
    </header>
  );
}
