import Link from "next/link";
import { getDashboardStats, getRecentPosts, getPendingComments } from "@/lib/admin";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "控制台 · 概览" };

export default async function DashboardPage() {
  const [stats, posts, pending] = await Promise.all([
    getDashboardStats(),
    getRecentPosts(5),
    getPendingComments(5),
  ]);

  const cards = [
    { label: "文章总数", value: stats.postCount, sub: `已发布 ${stats.publishedPosts} · 草稿 ${stats.draftPosts}`, tone: "border-t-accent" },
    { label: "总浏览量", value: stats.views.toLocaleString(), sub: `${stats.tagCount} 个标签`, tone: "border-t-gold" },
    { label: "拾语", value: stats.shiyuCount, sub: "一条一句，攒在时间的线上", tone: "border-t-sage" },
    { label: "评论总数", value: stats.commentCount, sub: `待审核 ${stats.pendingComments} 条`, tone: "border-t-ink" },
  ];

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <h1 className="font-serif text-2xl font-black">控制台</h1>
        <span className="pt-1 font-mono text-[10px] tracking-[.25em] text-inksoft">OVERVIEW</span>
      </header>

      {/* 统计卡 */}
      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {cards.map((c, i) => (
          <div
            key={c.label}
            className={`reveal border border-line border-t-2 bg-card p-5 ${c.tone}`}
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            <p className="font-mono text-[10px] tracking-[.2em] text-inksoft">{c.label}</p>
            <p className="mt-3 font-serif text-3xl font-black">{c.value}</p>
            <p className="mt-1 font-mono text-[10px] text-inksoft">{c.sub}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {/* 最新文章 */}
        <div className="border border-line bg-card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-line px-6 pb-4 pt-5">
            <div>
              <h2 className="font-serif text-lg font-black">最新文章</h2>
              <p className="mt-0.5 font-mono text-[10px] text-inksoft">RECENT POSTS</p>
            </div>
            <Link href="/dashboard/posts" className="font-mono text-[10px] text-inksoft transition-colors hover:text-accent">
              全部 {stats.postCount} 篇 →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-linesoft text-left font-mono text-[10px] tracking-[.15em] text-inksoft">
                  <th className="px-6 py-3 font-normal">标题</th>
                  <th className="px-3 py-3 font-normal">状态</th>
                  <th className="hidden px-3 py-3 text-right font-normal sm:table-cell">浏览</th>
                  <th className="hidden px-6 py-3 text-right font-normal md:table-cell">更新</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-linesoft">
                {posts.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-paper/60">
                    <td className="px-6 py-3.5">
                      <Link href={`/dashboard/posts/${p.id}/edit`} className="font-serif font-bold leading-snug transition-colors hover:text-accent">
                        {p.title}
                      </Link>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className={`status-pill inline-flex items-center gap-1 border px-2 py-0.5 font-mono text-[10px] tracking-[.1em] ${p.published ? "border-sage text-sage" : "border-gold text-gold"}`}>
                        {p.published ? "已发布" : "草稿"}
                      </span>
                    </td>
                    <td className="hidden px-3 py-3.5 text-right font-mono text-xs sm:table-cell">{p.views}</td>
                    <td className="hidden px-6 py-3.5 text-right font-mono text-[11px] text-inksoft md:table-cell">
                      {formatDate(p.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 待审评论 */}
        <div className="border border-line bg-card">
          <div className="flex items-center justify-between border-b border-line px-6 pb-4 pt-5">
            <div>
              <h2 className="font-serif text-lg font-black">待审核评论</h2>
              <p className="mt-0.5 font-mono text-[10px] text-inksoft">PENDING</p>
            </div>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent font-mono text-[10px] text-paper">
              {pending.length}
            </span>
          </div>
          {pending.length === 0 ? (
            <p className="px-6 py-10 text-center font-mono text-xs text-inksoft">没有待审核评论</p>
          ) : (
            <ul className="divide-y divide-linesoft">
              {pending.map((c) => (
                <li key={c.id} className="px-6 py-4">
                  <p className="text-sm font-medium">
                    {c.author.name ?? "匿名"}
                    <span className="font-mono text-[10px] text-inksoft"> · {formatDate(c.createdAt)}</span>
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-inksoft">{c.content}</p>
                  <p className="mt-1 font-mono text-[10px] text-accent">评论于《{c.post.title}》</p>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t border-line px-6 py-4">
            <Link
              href="/dashboard/comments"
              className="block border border-line py-2.5 text-center font-mono text-[10px] tracking-[.2em] text-inksoft transition-colors hover:border-ink hover:text-ink"
            >
              进入评论管理 →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
