"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MDXComponents from "@/components/posts/MDXComponents";
import Mermaid from "@/components/posts/Mermaid";

/**
 * 后台编辑器 Markdown 预览（客户端渲染）
 * 复用前台 MDX 纸感排版组件，代码块若为 mermaid 则渲染图表。
 * 注意：这是接近前台效果的预览，不是逐像素还原（自定义 MDX 组件/JSX 不在此渲染）。
 */

// react-markdown 会给组件注入 node 等内部 props，剥掉再传给纸感组件，避免泄漏到 DOM
const strip =
  (C: React.ComponentType<any>) =>
  ({ node: _n, inline: _i, ...props }: any) =>
    <C {...props} />;

// ```mermaid 代码块 → 渲染图表，不再用 <pre> 包裹
function PreviewPre({ children, ...props }: React.ComponentProps<"pre">) {
  const child = Array.isArray(children) ? children[0] : children;
  const cls = (child as any)?.props?.className as string | undefined;
  if (typeof child === "object" && child && /language-mermaid/.test(cls ?? "")) {
    const text = String((child as any)?.props?.children ?? "");
    return <Mermaid code={text} />;
  }
  return <pre {...props}>{children}</pre>;
}

const components = Object.fromEntries(
  Object.entries(MDXComponents)
    .filter(([key]) => key !== "Mermaid") // 自定义组件不走 react-markdown 元素映射
    .map(([key, C]) => [key, strip(C)])
);
components.pre = PreviewPre;

export default function PostPreview({ content }: { content: string }) {
  return (
    <div className="mdx-body max-h-[70vh] overflow-y-auto border border-line bg-paper p-6 font-serif md:p-8">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content || "*（还没有内容，切回「编辑」输入 Markdown）*"}
      </ReactMarkdown>
    </div>
  );
}
