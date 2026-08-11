import Link from "next/link";
import { getAdminPosts } from "@/lib/admin";
import { formatDate } from "@/lib/utils";
import DeleteButton from "@/components/admin/DeleteButton";

export const metadata = { title: "文章管理" };

export default async function AdminPostsPage() {
  const posts = await getAdminPosts();

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-serif text-2xl font-black">文章管理</h1>
          <span className="pt-1 font-mono text-[10px] tracking-[.25em] text-inksoft">
            POSTS · {posts.length}
          </span>
        </div>
        <Link
          href="/dashboard/posts/new"
          className="flex h-10 items-center gap-2 bg-accent px-5 font-mono text-xs tracking-[.15em] text-paper transition-colors hover:bg-accentdeep"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <path d="M12 5v14M5 12h14" />
          </svg>
          新建文章
        </Link>
      </header>

      <div className="border border-line bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-linesoft text-left font-mono text-[10px] tracking-[.15em] text-inksoft">
                <th className="px-6 py-3 font-normal">标题</th>
                <th className="hidden px-3 py-3 font-normal lg:table-cell">标签</th>
                <th className="px-3 py-3 font-normal">状态</th>
                <th className="hidden px-3 py-3 text-right font-normal sm:table-cell">浏览</th>
                <th className="hidden px-3 py-3 text-right font-normal sm:table-cell">赞</th>
                <th className="hidden px-3 py-3 font-normal md:table-cell">更新</th>
                <th className="px-6 py-3 text-right font-normal">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-linesoft">
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center font-mono text-xs text-inksoft">
                    还没有文章，点右上角「新建文章」开始。
                  </td>
                </tr>
              ) : (
                posts.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-paper/60">
                    <td className="px-6 py-3.5">
                      <Link
                        href={`/dashboard/posts/${p.id}/edit`}
                        className="font-serif font-bold leading-snug transition-colors hover:text-accent"
                      >
                        {p.title}
                      </Link>
                      <p className="mt-0.5 font-mono text-[10px] text-inksoft">/{p.slug}</p>
                    </td>
                    <td className="hidden px-3 py-3.5 lg:table-cell">
                      <div className="flex flex-wrap gap-1.5">
                        {p.tags.map((t) => (
                          <span key={t.slug} className="border border-line px-1.5 py-0.5 font-mono text-[10px] text-inksoft">
                            {t.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className={`inline-flex items-center gap-1 border px-2 py-0.5 font-mono text-[10px] tracking-[.1em] ${p.published ? "border-sage text-sage" : "border-gold text-gold"}`}>
                        {p.published ? "已发布" : "草稿"}
                      </span>
                    </td>
                    <td className="hidden px-3 py-3.5 text-right font-mono text-xs sm:table-cell">{p.views}</td>
                    <td className="hidden px-3 py-3.5 text-right font-mono text-xs sm:table-cell">{p.likes}</td>
                    <td className="hidden px-3 py-3.5 font-mono text-[11px] text-inksoft md:table-cell">{formatDate(p.updatedAt)}</td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/dashboard/posts/${p.id}/edit`}
                          title="编辑"
                          className="flex h-7 w-7 items-center justify-center text-inksoft transition-colors hover:bg-paper2 hover:text-ink"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                            <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                          </svg>
                        </Link>
                        <DeleteButton id={p.id} action={`/api/posts/${p.id}`} small />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
