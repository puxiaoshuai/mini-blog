"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

/** 访客评论表单：提交后待审核（published=false），admin 通过后显示 */
export default function CommentForm({ postId }: { postId: string }) {
  const t = useTranslations("blog.commentForm");
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // 兜底：个别浏览器 maxLength 对粘贴不严格，提交前再拦一道
    if (content.trim().length > 100) {
      setMessage(t("tooLong"));
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, name, email, content }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setMessage(data?.error ?? t("submitFailed"));
        return;
      }
      setContent("");
      setMessage(t("submitted"));
      router.refresh();
    } catch {
      setMessage(t("networkError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-5 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder={t("nickname")}
          className="h-10 border border-line bg-paper px-3 text-sm transition-colors focus:border-ink focus:outline-none"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("email")}
          className="h-10 border border-line bg-paper px-3 text-sm transition-colors focus:border-ink focus:outline-none"
        />
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        rows={4}
        maxLength={100}
        placeholder={t("contentPlaceholder")}
        className="w-full border border-line bg-paper px-3 py-3 text-sm leading-relaxed transition-colors focus:border-ink focus:outline-none"
      />
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] text-inksoft">
          {t("moderation")}
          <span className={`ml-2 ${content.length > 90 ? "text-accent" : "text-inksoft"}`}>
            {content.length}/100
          </span>
        </p>
        <button
          type="submit"
          disabled={busy}
          className="h-10 bg-accent px-6 font-mono text-xs tracking-[.15em] text-paper transition-colors hover:bg-accentdeep disabled:opacity-60"
        >
          {busy ? t("submitting") : t("submit")}
        </button>
      </div>
      {message && <p className="font-mono text-xs text-accent">{message}</p>}
    </form>
  );
}
