"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";

/** 评论审核：通过 / 转为待审（PUT /api/comments/[id]） */
export default function ApproveCommentButton({ id, published }: { id: string; published: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onClick() {
    setBusy(true);
    const res = await fetch(`/api/comments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    });
    if (res.ok) router.refresh();
    else window.alert("操作失败，请稍后再试");
    setBusy(false);
  }

  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={`h-8 flex-1 font-mono text-[10px] tracking-[.15em] transition-colors disabled:opacity-50 ${
        published
          ? "border border-line text-inksoft hover:border-ink hover:text-ink"
          : "bg-sage text-paper hover:opacity-90"
      }`}
    >
      {busy ? "…" : published ? "转为待审" : "通过"}
    </button>
  );
}
