import type { Metadata } from "next";
import Link from "next/link";
import { getAllTags } from "@/lib/posts";
import TagSidebar from "@/components/tags/TagSidebar";

export const metadata: Metadata = { title: "标签索引" };

export default async function TagsPage() {
  const tags = await getAllTags();

  return (
    <div className="mx-auto max-w-6xl px-5 pt-14 md:pt-20">
      <div className="mb-2 flex items-center gap-4">
        <span className="eyebrow text-[11px] text-accent">标签索引</span>
        <span className="font-mono text-[10px] tracking-[.25em] text-inksoft">
          TAG INDEX · {tags.length} 标签
        </span>
        <div className="h-px flex-1 bg-line" />
      </div>
      <h1 className="font-serif text-4xl font-black md:text-5xl">按主题，找文章。</h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-inksoft">
        左侧是栏目与标签的分类索引，右侧是所选主题下的全部文章归档。从 AI
        工具到 TypeScript，从日记到拾语——总有你在找的那一篇。
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        <aside className="hidden lg:col-span-3 lg:block">
          <div className="sticky top-24">
            <TagSidebar tags={tags} />
          </div>
        </aside>

        <div className="min-w-0 lg:col-span-9">
          {tags.length === 0 ? (
            <p className="py-16 text-center text-inksoft">还没有任何标签。</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {tags.map((tag) => (
                <Link
                  key={tag.slug}
                  href={`/tags/${tag.slug}`}
                  className="card-raise flex items-baseline justify-between border border-line bg-card p-6 transition-colors hover:border-ink"
                >
                  <span className="font-serif text-xl font-black transition-colors group-hover:text-accent">
                    # {tag.name}
                  </span>
                  <span className="font-mono text-[11px] text-inksoft">
                    {tag.count} 篇
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
