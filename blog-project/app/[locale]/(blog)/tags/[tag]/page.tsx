import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAllTags, getPostsByTag } from "@/lib/posts";
import { Link } from "@/i18n/navigation";
import TagSidebar from "@/components/tags/TagSidebar";

type Params = Promise<{ locale: string; tag: string }>;

// 强制动态渲染：与 posts/[slug] 同理，避免 ISR on-demand 静态生成路径下 next-intl
// 读 headers() 触发 DYNAMIC_SERVER_USAGE 500。
export const dynamic = "force-dynamic";

const MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((t) => ({ tag: t.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, tag } = await params;
  const data = await getPostsByTag(tag);
  const t = await getTranslations({ locale, namespace: "tags" });
  return { title: data ? `# ${data.name}` : t("title") };
}

type MonthGroup = { key: string; year: number; month: number; posts: NonNullable<Awaited<ReturnType<typeof getPostsByTag>>>["posts"] };

function groupByMonth(posts: { createdAt: Date }[]) {
  const map = new Map<string, MonthGroup>();
  for (const p of posts) {
    const y = p.createdAt.getFullYear();
    const m = p.createdAt.getMonth() + 1;
    const key = `${y}-${String(m).padStart(2, "0")}`;
    if (!map.has(key)) {
      map.set(key, {
        key,
        year: y,
        month: m,
        posts: [],
      });
    }
    map.get(key)!.posts.push(p as never);
  }
  return [...map.values()];
}

export default async function TagPage({ params }: { params: Params }) {
  const { locale, tag } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("tags");
  const common = await getTranslations("common");

  const [data, tags] = await Promise.all([getPostsByTag(tag), getAllTags()]);
  if (!data) notFound();

  const months = groupByMonth(data.posts);
  // 月份名：中文用数字（2026 年 3 月），英文用缩写（MAR 2026）
  const monthLabel = (y: number, m: number) =>
    t("monthLabel", { year: y, month: locale === "zh" ? String(m) : MONTHS[m - 1] });

  return (
    <div className="mx-auto max-w-6xl px-5 pt-14 md:pt-20">
      <div className="mb-2 flex items-center gap-4">
        <span className="eyebrow text-[11px] text-accent">{t("eyebrow")}</span>
        <span className="font-mono text-[10px] tracking-[.25em] text-inksoft">
          {t("sub", { count: tags.length })}
        </span>
        <div className="h-px flex-1 bg-line" />
      </div>

      <div className="mt-6 grid gap-10 lg:grid-cols-12">
        <aside className="hidden lg:col-span-3 lg:block">
          <div className="sticky top-24">
            <TagSidebar tags={tags} active={data.slug} />
          </div>
        </aside>

        <div className="min-w-0 lg:col-span-9">
          {/* 标签 hero */}
          <section className="reveal border border-line bg-card p-6 md:p-8">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h2 className="font-serif text-3xl font-black md:text-4xl">
                # {data.name}
              </h2>
              <span className="font-mono text-xs text-inksoft">
                {t("byMonth", { count: data.posts.length })}
              </span>
            </div>
          </section>

          {/* 归档时间线 */}
          <section className="mt-10">
            <div className="mb-2 flex items-center gap-3">
              <h3 className="font-serif text-xl font-black">{t("archive")}</h3>
              <span className="pt-1 font-mono text-[10px] tracking-[.25em] text-inksoft">
                {t("archiveSub")}
              </span>
              <div className="h-px flex-1 bg-line" />
            </div>

            {months.length === 0 ? (
              <p className="py-16 text-center text-inksoft">{t("emptyTag")}</p>
            ) : (
              <ol className="relative ml-2 mt-8 border-l border-line">
                {months.map((month) => (
                  <li key={month.key} className="relative pb-14 pl-8">
                    <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-accent ring-4 ring-paper" />
                    <div className="flex items-baseline gap-3">
                      <h4 className="font-serif text-xl font-black">
                        {monthLabel(month.year, month.month)}
                      </h4>
                      <span className="font-mono text-[10px] tracking-[.2em] text-inksoft">
                        {MONTHS[month.month - 1]} ·
                        {t("postsCount", { count: month.posts.length })}
                      </span>
                    </div>
                    <div className="mt-5 divide-y divide-line border-t border-line">
                      {month.posts.map((p) => (
                        <article key={p.slug} className="group py-5">
                          <div className="grid grid-cols-12 items-baseline gap-3">
                            <span className="col-span-2 font-mono text-[11px] text-inksoft sm:col-span-1">
                              {String(p.createdAt.getDate()).padStart(2, "0")}
                              .{String(p.createdAt.getMonth() + 1).padStart(2, "0")}
                            </span>
                            <div className="col-span-10 sm:col-span-8">
                              <Link href={`/posts/${p.slug}`}>
                                <h5 className="font-serif text-lg font-bold leading-snug transition-colors group-hover:text-accent">
                                  {p.title}
                                </h5>
                              </Link>
                              {p.excerpt && (
                                <p className="mt-1 hidden text-sm text-inksoft md:block">
                                  {p.excerpt}
                                </p>
                              )}
                            </div>
                            <div className="col-span-3 flex items-center justify-end font-mono text-[11px] text-inksoft">
                              <span>→ {common("read")}</span>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
