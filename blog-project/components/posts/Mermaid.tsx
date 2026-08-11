"use client";

import { useEffect, useId, useRef, useState } from "react";

/**
 * Mermaid 图表组件（客户端渲染）
 * 由 remark 插件把 ```mermaid 代码块编译为 <Mermaid code="..." />。
 * mermaid 用动态 import 懒加载：只有页面含图时才下载（保持博客轻量）。
 */
export default function Mermaid({ code }: { code: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const boxRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "loose",
          theme: "base",
          themeVariables: {
            fontFamily: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
            fontFamilyCode: '"IBM Plex Mono", ui-monospace, monospace',
          },
        });
        const { svg } = await mermaid.render(`mermaid-${uid}`, code);
        if (!cancelled && boxRef.current) boxRef.current.innerHTML = svg;
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code, uid]);

  return (
    <div className="my-8 overflow-x-auto border border-line bg-card p-4">
      {error ? (
        <p className="font-mono text-xs leading-relaxed text-accent">
          Mermaid 渲染失败：{error}
        </p>
      ) : (
        <div ref={boxRef} className="flex justify-center" />
      )}
    </div>
  );
}
