import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

/**
 * 分页组件（可复用）· 纸感风格 · 链接式
 *
 * 渲染真实链接（?page=N）→ URL 参数随翻页变化，可收藏/分享/前进后退；
 * 数据由后端按 ?page=N 分页返回（服务端 ISR）。
 * 用法：<Pagination page={page} totalPages={totalPages} basePath="/posts" />
 */

/** 页码窗口：当前页 ±2 + 首尾，超长用省略号 */
function pageRange(page: number, total: number): (number | "…")[] {
  const out: (number | "…")[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(total, page + 2);
  if (start > 1) {
    out.push(1);
    if (start > 2) out.push("…");
  }
  for (let i = start; i <= end; i++) out.push(i);
  if (end < total) {
    if (end < total - 1) out.push("…");
    out.push(total);
  }
  return out;
}

const btn =
  "inline-flex h-9 items-center justify-center border px-3 font-mono text-xs transition-colors";
const idle = "border-line text-inksoft hover:border-ink hover:text-ink";
const disabled = "pointer-events-none border-linesoft text-inksoft/50";

export default async function Pagination({
  page,
  totalPages,
  basePath = "/posts",
}: {
  page: number;
  totalPages: number;
  basePath?: string;
}) {
  const t = await getTranslations("blog.pagination");
  if (totalPages <= 1) return null;

  // 第 1 页用无参路径，保持 URL 干净（/posts 而非 /posts?page=1）
  const hrefFor = (n: number) => (n === 1 ? basePath : `${basePath}?page=${n}`);

  return (
    <nav aria-label={t("aria")} className="mt-10 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={`${btn} ${idle}`}>
          {t("prev")}
        </Link>
      ) : (
        <span className={`${btn} ${disabled}`}>{t("prev")}</span>
      )}

      {pageRange(page, totalPages).map((n, idx) =>
        n === "…" ? (
          <span key={`e${idx}`} className="px-1 font-mono text-xs text-inksoft">
            …
          </span>
        ) : (
          <Link
            key={n}
            href={hrefFor(n)}
            aria-current={n === page ? "page" : undefined}
            className={`${btn} w-9 px-0 ${
              n === page ? "border-ink bg-night text-nighttext" : idle
            }`}
          >
            {n}
          </Link>
        )
      )}

      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} className={`${btn} ${idle}`}>
          {t("next")}
        </Link>
      ) : (
        <span className={`${btn} ${disabled}`}>{t("next")}</span>
      )}
    </nav>
  );
}
