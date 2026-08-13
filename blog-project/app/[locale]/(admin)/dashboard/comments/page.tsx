import { Link } from "@/i18n/navigation";
import { getAdminComments, getPendingCommentCount } from "@/lib/admin";
import { formatDate } from "@/lib/utils";
import ApproveCommentButton from "@/components/admin/ApproveCommentButton";
import DeleteButton from "@/components/admin/DeleteButton";
import Pagination from "@/components/posts/Pagination";

export const metadata = { title: "评论管理" };

const PAGE_SIZE = 10;

export default async function AdminCommentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const [pending, { items: comments, total, page: currentPage, totalPages }] =
    await Promise.all([
      getPendingCommentCount(),
      getAdminComments({ page, pageSize: PAGE_SIZE }),
    ]);

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <h1 className="font-serif text-2xl font-black">评论管理</h1>
        <span className="pt-1 font-mono text-[10px] tracking-[.25em] text-inksoft">
          COMMENTS · {total}（待审 {pending}）
        </span>
      </header>

      {comments.length === 0 ? (
        <div className="border border-line bg-card px-6 py-16 text-center font-mono text-xs text-inksoft">
          还没有评论
        </div>
      ) : (
        <>
          <ul className="space-y-4">
            {comments.map((c) => (
            <li key={c.id} className={`border border-line bg-card p-6 ${!c.published ? "border-l-2 border-l-accent" : ""}`}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] text-inksoft">
                  {formatDate(c.createdAt)}
                </span>
                <span
                  className={`border px-1.5 py-0.5 font-mono text-[9px] tracking-[.1em] ${
                    c.published ? "border-sage text-sage" : "border-accent text-accent"
                  }`}
                >
                  {c.published ? "已发布" : "待审核"}
                </span>
                <Link
                  href={`/posts/${c.post.slug}`}
                  className="font-mono text-[10px] text-accent transition-colors hover:underline"
                >
                  评论于《{c.post.title}》
                </Link>
              </div>
              <p className="mt-2 font-serif text-base leading-relaxed">{c.content}</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold font-serif font-black text-paper">
                  {(c.author.name ?? "匿")[0]}
                </span>
                <p className="text-sm font-medium">
                  {c.author.name ?? "匿名"}
                  {c.author.email && (
                    <span className="ml-2 font-mono text-[10px] text-inksoft">{c.author.email}</span>
                  )}
                  {c.ip && (
                    <span className="ml-2 font-mono text-[10px] text-inksoft">IP {c.ip}</span>
                  )}
                </p>
                <div className="ml-auto flex w-40 items-center gap-2">
                  <ApproveCommentButton id={c.id} published={c.published} />
                  <div className="flex-1">
                    <DeleteButton id={c.id} action={`/api/comments/${c.id}`} />
                  </div>
                </div>
              </div>
            </li>
            ))}
          </ul>
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            basePath="/dashboard/comments"
          />
        </>
      )}
    </div>
  );
}
