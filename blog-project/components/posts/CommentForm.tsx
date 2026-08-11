"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** 访客评论表单：提交后待审核（published=false），admin 通过后显示 */
export default function CommentForm({ postId }: { postId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
        setMessage(data?.error ?? "提交失败");
        return;
      }
      setContent("");
      setMessage("评论已提交，待审核通过后展示。");
      router.refresh();
    } catch {
      setMessage("网络错误，请稍后再试");
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
          placeholder="昵称 *"
          className="h-10 border border-line bg-paper px-3 text-sm transition-colors focus:border-ink focus:outline-none"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="邮箱（选填，不会公开）"
          className="h-10 border border-line bg-paper px-3 text-sm transition-colors focus:border-ink focus:outline-none"
        />
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        rows={4}
        placeholder="写下你的留言… *"
        className="w-full border border-line bg-paper px-3 py-3 text-sm leading-relaxed transition-colors focus:border-ink focus:outline-none"
      />
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] text-inksoft">评论经审核后展示 · 请友善发言</p>
        <button
          type="submit"
          disabled={busy}
          className="h-10 bg-accent px-6 font-mono text-xs tracking-[.15em] text-paper transition-colors hover:bg-accentdeep disabled:opacity-60"
        >
          {busy ? "提交中…" : "提交评论"}
        </button>
      </div>
      {message && <p className="font-mono text-xs text-accent">{message}</p>}
    </form>
  );
}
