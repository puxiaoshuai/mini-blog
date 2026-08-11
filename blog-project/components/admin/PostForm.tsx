"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type PostFormData = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  published: boolean;
  tags: string[]; // 标签名
};

/** 文章新建 / 编辑表单（客户端，调 /api/posts） */
export default function PostForm({ post }: { post?: PostFormData }) {
  const router = useRouter();
  const isEdit = Boolean(post?.id);

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? "");
  const [published, setPublished] = useState(post?.published ?? true);
  const [tags, setTags] = useState(post?.tags.join(", ") ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const tagNames = tags.split(",").map((t) => t.trim()).filter(Boolean);
    const payload = { title, slug, excerpt, content, coverImage, published, tags: tagNames };
    const url = isEdit ? `/api/posts/${post!.id}` : "/api/posts";

    try {
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "保存失败，请稍后再试");
        return;
      }
      router.push("/dashboard/posts");
      router.refresh();
    } catch {
      setError("网络错误，请稍后再试");
    } finally {
      setBusy(false);
    }
  }

  const inputCls =
    "h-10 w-full border border-line bg-paper px-3 text-sm transition-colors focus:border-ink focus:outline-none";
  const labelCls = "mb-1.5 block font-mono text-[10px] tracking-[.2em] text-inksoft";

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className={labelCls}>标题 / TITLE *</label>
        <input
          id="title" required value={title} onChange={(e) => setTitle(e.target.value)}
          className={`${inputCls} h-12 font-serif text-lg font-bold`}
          placeholder="文章标题"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="slug" className={labelCls}>slug（留空自动生成）</label>
          <input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} className={inputCls} placeholder="my-article-slug" />
        </div>
        <div>
          <label htmlFor="tags" className={labelCls}>标签 / TAGS（逗号分隔）</label>
          <input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} className={inputCls} placeholder="Next.js, TypeScript" />
        </div>
      </div>

      <div>
        <label htmlFor="excerpt" className={labelCls}>摘要 / EXCERPT</label>
        <input id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className={inputCls} placeholder="一句话摘要" />
      </div>

      <div>
        <label htmlFor="content" className={labelCls}>正文（MDX）*</label>
        <textarea
          id="content" required value={content} onChange={(e) => setContent(e.target.value)}
          rows={16}
          className="w-full border border-line bg-paper px-3 py-3 font-mono text-[13px] leading-relaxed transition-colors focus:border-ink focus:outline-none"
          placeholder={"## 小标题\n\n正文内容，支持 **加粗**、`行内代码`、```代码块```、表格…"}
        />
        <p className="mt-1 font-mono text-[10px] text-inksoft">支持 Markdown / MDX 语法，首字下沉由前台排版自动处理</p>
      </div>

      <div>
        <label htmlFor="cover" className={labelCls}>封面图 URL</label>
        <input id="cover" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} className={inputCls} placeholder="https://…" />
      </div>

      <label className="flex items-center gap-3 border border-line bg-card px-4 py-3">
        <input
          type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)}
          className="h-4 w-4 accent-[#A63D2F]"
        />
        <span className="font-mono text-xs tracking-[.15em]">
          发布（{published ? "已发布" : "草稿"}）
        </span>
      </label>

      {error && <p className="font-mono text-xs text-accent">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit" disabled={busy}
          className="h-11 bg-accent px-8 font-mono text-xs tracking-[.2em] text-paper transition-colors hover:bg-accentdeep disabled:opacity-60"
        >
          {busy ? "保存中…" : isEdit ? "保存修改" : "发布文章"}
        </button>
        <a
          href="/dashboard/posts"
          className="inline-flex h-11 items-center border border-ink px-6 font-mono text-xs tracking-[.2em] transition-colors hover:bg-ink hover:text-paper"
        >
          取消
        </a>
      </div>
    </form>
  );
}
