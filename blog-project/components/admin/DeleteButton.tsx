"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";

/** 通用删除按钮：confirm → DELETE 对应 action → router.refresh() */
export default function DeleteButton({
  action,
  label = "删除",
  small,
}: {
  /** 删除目标 id（已在 action 中体现，保留作语义） */
  id: string;
  action: string;
  label?: string;
  small?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    if (!window.confirm("确定删除吗？此操作不可撤销。")) return;
    setBusy(true);
    try {
      const res = await fetch(action, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      window.alert("删除失败，请稍后再试");
      setBusy(false);
    }
  }

  return (
    <button
      onClick={onDelete}
      disabled={busy}
      title={label}
      className={
        small
          ? "flex h-7 w-7 items-center justify-center text-inksoft transition-colors hover:bg-paper2 hover:text-accent disabled:opacity-50"
          : "h-8 flex-1 border border-line font-mono text-[10px] tracking-[.15em] text-accentdeep transition-colors hover:border-accentdeep disabled:opacity-50"
      }
    >
      {small ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
        </svg>
      ) : (
        busy ? "删除中…" : label
      )}
    </button>
  );
}
