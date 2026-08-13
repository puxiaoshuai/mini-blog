import type { TocItem } from "@/lib/mdx";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";

/** 文章侧栏目录（静态；滚动高亮留待 M5 打磨） */
export default async function Toc({ items }: { items: TocItem[] }) {
  const t = await getTranslations("post");
  if (items.length === 0) return null;

  return (
    <div className="border border-line bg-card/70 p-6">
      <p className="eyebrow mb-4 text-[10px] text-inksoft">{t("tocTitle")}</p>
      <ul className="space-y-3 border-l border-line pl-4 text-sm">
        {items.map((item) => (
          <li key={item.id} className={cn(item.level === 3 && "pl-4")}>
            <a
              href={`#${item.id}`}
              className="text-inksoft transition-colors hover:text-accent"
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
