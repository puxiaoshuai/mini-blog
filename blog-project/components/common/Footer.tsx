import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const NAV_KEYS = [
  { href: "/posts", key: "posts" },
  { href: "/shiyu", key: "shiyu" },
  { href: "/tags", key: "tags" },
  { href: "/about", key: "about" },
] as const;

export default async function Footer() {
  const t = await getTranslations("common");

  return (
    <footer className="mt-20 border-t border-line">
      <div className="mx-auto max-w-6xl px-5">
        {/* ═══ 品牌 + 简洁导航 ═══ */}
        <div className="flex flex-col gap-10 py-14 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-2xl font-black">{t("siteName")}</span>
              <span className="font-mono text-[10px] uppercase tracking-[.3em] text-inksoft">
                Puxiaoshuai.top
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-inksoft">
              {t("footer.desc")}
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-x-7 gap-y-3 text-sm">
            {NAV_KEYS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="u-link transition-colors hover:text-accent"
              >
                {t(`nav.${item.key}`)}
              </Link>
            ))}
            <a
              href="mailto:1372553910@qq.com"
              className="u-link transition-colors hover:text-accent"
            >
              {t("footer.writeToMe")}
            </a>
          </nav>
        </div>

        {/* ═══ 版权行 + 备案信息 ═══ */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-linesoft py-5 font-mono text-[10px] tracking-[.2em] text-inksoft md:flex-row">
          <div className="flex flex-col items-center gap-1.5 md:items-start">
            <p>{t("footer.copyright")}</p>
            <p className="flex flex-wrap items-center justify-center gap-x-3">
              <a
                href="https://beian.mps.gov.cn/#/query/webSearch?code=51012202001842"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center transition-colors hover:text-accent"
              >
                <img
                  src="https://www.puxiaoshuai.top/wp-content/uploads/2024/06/6446d860dbbfe540e9e270.png"
                  alt=""
                  width="16"
                  height="16"
                  className="mr-1.5 align-[-3px]"
                />
                {t("footer.beianGongan")}
              </a>
              <a
                href="https://beian.miit.gov.cn/#/Integrated/index"
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-accent"
              >
                {t("footer.beianIcp")}
              </a>
            </p>
          </div>
          <p>{t("footer.builtWith")}</p>
        </div>
      </div>
    </footer>
  );
}
