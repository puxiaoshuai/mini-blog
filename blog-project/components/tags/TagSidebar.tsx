import Link from "next/link";
import { cn } from "@/lib/utils";

export type TagSidebarData = {
  name: string;
  slug: string;
  count: number;
};

/** 标签索引侧栏（左缘朱红条标记当前） */
export default function TagSidebar({
  tags,
  active,
}: {
  tags: TagSidebarData[];
  active?: string;
}) {
  return (
    <div className="border border-line bg-card/70">
      <div className="border-b border-line px-5 pb-4 pt-5">
        <p className="font-serif text-base font-black">全部主题</p>
        <p className="mt-0.5 font-mono text-[10px] text-inksoft">栏目 · 标签 双索引</p>
      </div>
      <div className="space-y-6 px-3 py-4">
        <div>
          <p className="px-2 pb-2 font-mono text-[9px] tracking-[.3em] text-inksoft">
            标签 / TAGS
          </p>
          <ul className="space-y-0.5">
            {tags.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/tags/${t.slug}`}
                  className={cn("tag-link", active === t.slug && "active")}
                >
                  {t.name}
                  <span className="cnt">{t.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-line px-5 py-4">
        <Link
          href="/posts"
          className="font-mono text-[10px] text-inksoft transition-colors hover:text-accent"
        >
          按时间归档
        </Link>
      </div>
    </div>
  );
}
