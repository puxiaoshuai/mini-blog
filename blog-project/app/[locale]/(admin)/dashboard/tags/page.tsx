import { Link } from "@/i18n/navigation";
import { getAllTags } from "@/lib/posts";

export const metadata = { title: "标签管理" };

export default async function AdminTagsPage() {
  const tags = await getAllTags();

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <h1 className="font-serif text-2xl font-black">标签管理</h1>
        <span className="pt-1 font-mono text-[10px] tracking-[.25em] text-inksoft">
          TAGS · {tags.length}
        </span>
      </header>

      <div className="border border-line bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-linesoft text-left font-mono text-[10px] tracking-[.15em] text-inksoft">
                <th className="px-6 py-3 font-normal">标签</th>
                <th className="px-3 py-3 font-normal">slug</th>
                <th className="px-6 py-3 text-right font-normal">文章数</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-linesoft">
              {tags.map((t) => (
                <tr key={t.slug} className="transition-colors hover:bg-paper/60">
                  <td className="px-6 py-3.5">
                    <Link
                      href={`/tags/${t.slug}`}
                      className="border border-accent px-2 py-1 font-mono text-[11px] text-accent transition-colors hover:bg-accent hover:text-paper"
                    >
                      {t.name}
                    </Link>
                  </td>
                  <td className="px-3 py-3.5 font-mono text-xs text-inksoft">/{t.slug}</td>
                  <td className="px-6 py-3.5 text-right font-mono text-xs">{t.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="font-mono text-[10px] text-inksoft">
        标签随文章自动创建（文章表单里用逗号分隔填写），无需单独维护。
      </p>
    </div>
  );
}
