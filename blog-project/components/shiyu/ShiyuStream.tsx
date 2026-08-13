"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import ShiyuTimeline, { type ShiyuItem } from "./ShiyuTimeline";

/**
 * 拾语流：初始一批由服务端（ISR）传入，翻页经 /api/shiyu 增量加载。
 */
export default function ShiyuStream({
  initialItems,
  total,
  pageSize,
}: {
  initialItems: ShiyuItem[];
  total: number;
  pageSize: number;
}) {
  const t = useTranslations("shiyu");
  const [items, setItems] = useState<ShiyuItem[]>(initialItems);
  const [page, setPage] = useState(2); // 下一页
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remaining = Math.max(0, total - items.length);

  async function loadMore() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/shiyu?page=${page}&pageSize=${pageSize}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("loadError"));
      setItems((prev) => [...prev, ...data.items]);
      setPage((p) => p + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("loadError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <ol className="relative ml-2 mt-8 border-l border-line">
        <ShiyuTimeline items={items} startIndex={0} />
      </ol>

      {error && (
        <p className="mt-6 text-center font-mono text-xs tracking-[.15em] text-accent">
          {error}
        </p>
      )}

      {remaining > 0 && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="mt-10 w-full border border-line py-3.5 font-mono text-xs tracking-[.2em] text-inksoft transition-colors hover:border-ink hover:text-ink disabled:opacity-60"
        >
          {loading ? t("loading") : t("loadMore", { remaining })}
        </button>
      )}
    </>
  );
}
