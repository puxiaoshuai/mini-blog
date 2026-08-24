"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "@/i18n/navigation";
import PostPreview from "./PostPreview";
import { COVER_PRESETS } from "@/lib/coverPresets";

export type PostFormData = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  published: boolean;
  tags: string[]; // 标签名
  createdAt?: string; // 创建时间（ISO，可编辑）；留空后端默认当前时间
};

/** 把 Date 格式化成 datetime-local 输入框需要的本地时间值：YYYY-MM-DDTHH:mm */
function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

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
  // 创建时间：编辑时用原时间，新建时默认当前时间（均转为本地时区显示）
  const [createdAt, setCreatedAt] = useState(() => {
    const base = post?.createdAt ? new Date(post.createdAt) : new Date();
    return Number.isNaN(base.getTime())
      ? toLocalInputValue(new Date())
      : toLocalInputValue(base);
  });
  // datetime-local 的 max：今天此时，禁用选择未来时间
  const [maxCreatedAt] = useState(() => toLocalInputValue(new Date()));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const tagNames = tags.split(",").map((t) => t.trim()).filter(Boolean);
    const payload = {
      title, slug, excerpt, content, coverImage, published, tags: tagNames,
      // 留空不传：新建默认当前时间，编辑保持原时间
      ...(createdAt ? { createdAt: new Date(createdAt).toISOString() } : {}),
    };
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
        <label htmlFor="createdAt" className={labelCls}>创建时间 / CREATED AT</label>
        <input
          id="createdAt"
          type="datetime-local"
          value={createdAt}
          max={maxCreatedAt}
          onChange={(e) => setCreatedAt(e.target.value)}
          className={inputCls}
        />
        <p className="mt-1 font-mono text-[10px] text-inksoft">
          留空保存时默认当前时间；今天之后的时间不可选择，可回填历史时间以调整文章展示顺序
        </p>
      </div>

      <div>
        <label htmlFor="excerpt" className={labelCls}>摘要 / EXCERPT</label>
        <input id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className={inputCls} placeholder="一句话摘要" />
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label
            htmlFor="content"
            className="block font-mono text-[10px] tracking-[.2em] text-inksoft"
          >
            正文（MDX）*
          </label>
          <div className="flex border border-line">
            <button
              type="button"
              onClick={() => setMode("edit")}
              className={`h-7 px-3 font-mono text-[10px] tracking-[.15em] transition-colors ${
                mode === "edit" ? "bg-night text-nighttext" : "text-inksoft hover:text-ink"
              }`}
            >
              编辑
            </button>
            <button
              type="button"
              onClick={() => setMode("preview")}
              className={`h-7 border-l border-line px-3 font-mono text-[10px] tracking-[.15em] transition-colors ${
                mode === "preview" ? "bg-night text-nighttext" : "text-inksoft hover:text-ink"
              }`}
            >
              预览
            </button>
          </div>
        </div>

        {mode === "edit" ? (
          <textarea
            id="content" required value={content} onChange={(e) => setContent(e.target.value)}
            rows={16}
            className="w-full border border-line bg-paper px-3 py-3 font-mono text-[13px] leading-relaxed transition-colors focus:border-ink focus:outline-none"
            placeholder={"## 小标题\n\n正文内容，支持 **加粗**、`行内代码`、```代码块```、表格…"}
          />
        ) : (
          <PostPreview content={content} />
        )}

        <p className="mt-1 font-mono text-[10px] text-inksoft">
          支持 Markdown / MDX 语法（含 ```mermaid 图表），首字下沉由前台排版自动处理
        </p>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label
            htmlFor="cover"
            className="block font-mono text-[10px] tracking-[.2em] text-inksoft"
          >
            封面图 URL
          </label>
          <button
            type="button"
            onClick={() =>
              setCoverImage(
                COVER_PRESETS[Math.floor(Math.random() * COVER_PRESETS.length)]
              )
            }
            className="font-mono text-[10px] tracking-[.15em] text-inksoft transition-colors hover:text-accent"
          >
            随机换一张 ↻
          </button>
        </div>
        <input
          id="cover"
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          className={inputCls}
          placeholder="https://…（留空则保存时自动随机选一张 coding 封面）"
        />
        {coverImage.startsWith("https://images.unsplash.com/") && (
          <div className="relative mt-2 aspect-[16/9] w-full overflow-hidden border border-line bg-paper2">
            <Image
              src={coverImage}
              alt="封面预览"
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
        )}
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
