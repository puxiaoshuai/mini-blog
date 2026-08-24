import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/** [locale] 层 not-found：渲染于 [locale] 布局内，intl 上下文可用（注意：此文件不接收 params） */
export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center px-5">
      {/* 卷轴断章：404 做成朱红大印 */}
      <div className="frame reveal relative border border-line bg-card px-10 py-12 text-center md:px-16">
        <p className="eyebrow text-accent">{t("eyebrow")}</p>

        {/* 404 印章体 */}
        <p className="seal mt-6 font-serif text-7xl font-black tracking-[.08em] text-accent md:text-8xl">
          404
        </p>

        <h1 className="ink-wipe mt-6 font-serif text-2xl font-black leading-relaxed md:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-4 max-w-sm font-mono text-xs leading-relaxed text-inksoft">
          {t("desc")}
        </p>

        {/* 中缝装饰线 */}
        <div className="mx-auto mt-8 flex w-40 items-center justify-center gap-3" aria-hidden>
          <span className="h-px flex-1 bg-line" />
          <span className="h-1.5 w-1.5 rotate-45 bg-accent" />
          <span className="h-px flex-1 bg-line" />
        </div>

        {/* 行动按钮：回首页 / 看文章 */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="flex h-11 items-center gap-2 bg-accent px-8 font-mono text-xs tracking-[.2em] text-nighttext transition-colors hover:bg-accentdeep"
          >
            {t("backHome")}
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/posts"
            className="flex h-11 items-center border border-ink px-8 font-mono text-xs tracking-[.2em] transition-colors hover:bg-ink hover:text-paper"
          >
            {t("browsePosts")}
          </Link>
        </div>
      </div>

      <p className="reveal mt-10 font-mono text-[10px] tracking-[.3em] text-inksoft" style={{ animationDelay: ".2s" }}>
        {t("footerNote")}
      </p>
    </main>
  );
}
