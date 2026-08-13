"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

/** 中英文切换：跳到当前路径的另一种语言（/zh ↔ /en） */
export default function LanguageToggle() {
  const locale = useLocale();
  const t = useTranslations("common.lang");
  const pathname = usePathname();
  const router = useRouter();

  const nextLocale = locale === "zh" ? "en" : "zh";

  return (
    <button
      onClick={() => router.replace(pathname, { locale: nextLocale })}
      title={t("switchTo")}
      aria-label={t("switchTo")}
      className="flex h-9 items-center justify-center border border-line px-2.5 font-mono text-[11px] tracking-widest transition-colors hover:border-ink hover:bg-card"
    >
      {t("label")}
    </button>
  );
}
