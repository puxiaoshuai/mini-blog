import { Link } from "@/i18n/navigation";

/**
 * 根级 not-found：兜住不带语言前缀、也匹配不到任何路由的 404
 * （此时无 [locale] 上下文，不能用 next-intl 服务端翻译，文案直接双写）
 */
export default function RootNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-5">
      <div className="frame relative border border-line bg-card px-10 py-12 text-center md:px-16">
        <p className="eyebrow text-accent">PAGE NOT FOUND · 找不到这一页</p>
        <p className="seal mt-6 font-serif text-7xl font-black tracking-[.08em] text-accent md:text-8xl">
          404
        </p>
        <h1 className="ink-wipe mt-6 font-serif text-2xl font-black leading-relaxed md:text-3xl">
          这一页散佚在时光之外。
        </h1>
        <p className="mt-4 max-w-sm font-mono text-xs leading-relaxed text-inksoft">
          This page seems to have slipped out of time.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/"
            className="flex h-11 items-center bg-accent px-8 font-mono text-xs tracking-[.2em] text-nighttext transition-colors hover:bg-accentdeep"
          >
            回首页 / HOME
          </Link>
        </div>
      </div>
    </main>
  );
}
