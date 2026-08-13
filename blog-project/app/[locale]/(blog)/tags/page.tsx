import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAllTags } from "@/lib/posts";
import { Link } from "@/i18n/navigation";
import TagSidebar from "@/components/tags/TagSidebar";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tags" });
  return { title: t("title") };
}

export default async function TagsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("tags");

  const tags = await getAllTags();

  return (
    <div className="mx-auto max-w-6xl px-5 pt-14 md:pt-20">
      <div className="mb-2 flex items-center gap-4">
        <span className="eyebrow text-[11px] text-accent">{t("eyebrow")}</span>
        <span className="font-mono text-[10px] tracking-[.25em] text-inksoft">
          {t("sub", { count: tags.length })}
        </span>
        <div className="h-px flex-1 bg-line" />
      </div>
      <h1 className="font-serif text-4xl font-black md:text-5xl">{t("h1")}</h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-inksoft">
        {t("desc")}
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        <aside className="hidden lg:col-span-3 lg:block">
          <div className="sticky top-24">
            <TagSidebar tags={tags} />
          </div>
        </aside>

        <div className="min-w-0 lg:col-span-9">
          {tags.length === 0 ? (
            <p className="py-16 text-center text-inksoft">{t("empty")}</p>
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
                    {t("postsCount", { count: tag.count })}
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
