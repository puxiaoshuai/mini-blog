"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { formatDate } from "@/lib/utils";
import DeleteButton from "./DeleteButton";

export type AdminShiyu = {
  id: string;
  no: number;
  content: string;
  images: string[] | null;
  pinned: boolean;
  published: boolean;
  createdAt: string;
};

/** 后台拾语管理：新建 + 列表 + 发布/置顶切换 + 删除（调 /api/shiyu） */
export default function ShiyuAdmin({ items, total }: { items: AdminShiyu[]; total: number }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [images, setImages] = useState("");
  const [pinned, setPinned] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const imageArr = images.split(",").map((u) => u.trim()).filter(Boolean);
    try {
      const res = await fetch("/api/shiyu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, images: imageArr, pinned }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "保存失败");
        return;
      }
      setContent("");
      setImages("");
      setPinned(false);
      router.refresh();
    } catch {
      setError("网络错误，请稍后再试");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(id: string, field: "published" | "pinned", value: boolean) {
    const res = await fetch(`/api/shiyu/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    if (res.ok) router.refresh();
    else window.alert("操作失败，请稍后再试");
  }

  return (
    <div className="space-y-8">
      {/* 新建 */}
      <section className="border border-line bg-card p-6">
        <h2 className="font-serif text-lg font-black">写一条拾语</h2>
        <p className="mt-0.5 font-mono text-[10px] text-inksoft">NEW SHIYU</p>
        <form onSubmit={create} className="mt-4 space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={3}
            className="w-full border border-line bg-paper px-3 py-3 font-serif text-base leading-relaxed transition-colors focus:border-ink focus:outline-none"
            placeholder="一句话，或一句话加一张图…"
          />
          <input
            value={images}
            onChange={(e) => setImages(e.target.value)}
            className="h-10 w-full border border-line bg-paper px-3 font-mono text-xs transition-colors focus:border-ink focus:outline-none"
            placeholder="配图 URL（多个用逗号分隔，可留空）"
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 font-mono text-xs">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                className="h-4 w-4 accent-[#A63D2F]"
              />
              置顶
            </label>
            <button
              type="submit"
              disabled={busy}
              className="h-10 bg-accent px-6 font-mono text-xs tracking-[.15em] text-paper transition-colors hover:bg-accentdeep disabled:opacity-60"
            >
              {busy ? "发布中…" : "发布"}
            </button>
          </div>
          {error && <p className="font-mono text-xs text-accent">{error}</p>}
        </form>
      </section>

      {/* 列表 */}
      <section className="border border-line bg-card">
        <div className="flex items-center justify-between border-b border-line px-6 pb-4 pt-5">
          <div>
            <h2 className="font-serif text-lg font-black">全部拾语</h2>
            <p className="mt-0.5 font-mono text-[10px] text-inksoft">SHIYU · {total} 条</p>
          </div>
        </div>
        {items.length === 0 ? (
          <p className="px-6 py-12 text-center font-mono text-xs text-inksoft">还没有拾语</p>
        ) : (
          <ul className="divide-y divide-linesoft">
            {items.map((s) => (
              <li key={s.id} className="flex items-start gap-4 px-6 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[10px] text-inksoft">N°{String(s.no).padStart(3, "0")}</span>
                    <span className="font-mono text-[10px] text-inksoft">{formatDate(s.createdAt)}</span>
                    {s.pinned && <span className="border border-accent px-1.5 font-mono text-[9px] text-accent">置顶</span>}
                    {!s.published && <span className="border border-gold px-1.5 font-mono text-[9px] text-gold">草稿</span>}
                    {s.images?.length ? <span className="font-mono text-[9px] text-inksoft">{s.images.length} 图</span> : null}
                  </div>
                  <p className="mt-1.5 font-serif text-base leading-relaxed">{s.content}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <button
                    onClick={() => toggle(s.id, "published", !s.published)}
                    className="h-8 border border-line px-3 font-mono text-[10px] text-inksoft transition-colors hover:border-ink hover:text-ink"
                  >
                    {s.published ? "转为草稿" : "发布"}
                  </button>
                  <button
                    onClick={() => toggle(s.id, "pinned", !s.pinned)}
                    className="h-8 border border-line px-3 font-mono text-[10px] text-inksoft transition-colors hover:border-ink hover:text-ink"
                  >
                    {s.pinned ? "取消置顶" : "置顶"}
                  </button>
                  <DeleteButton id={s.id} action={`/api/shiyu/${s.id}`} small />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
