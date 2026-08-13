import { getTranslations } from "next-intl/server";

/** 卷首细条 · 顶部通告条（恒定深色带，不随主题翻转） */
export default async function TopBar() {
  const t = await getTranslations("common");

  return (
    <div className="bg-night text-nighttext">
      <p className="mx-auto max-w-6xl px-5 py-2 text-center font-mono text-[11px] tracking-[.18em]">
        {t("topbar")}
      </p>
    </div>
  );
}
