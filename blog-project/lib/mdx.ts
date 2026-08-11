import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import GithubSlugger from "github-slugger";
import MDXComponents from "@/components/posts/MDXComponents";

/**
 * 防御性预处理：MDX 会把 `<xxx@yyy.com>` 当 JSX 标签解析（`@` 报错），
 * 普通 Markdown 里它本是邮箱自动链接。这里提前转成规范 markdown 链接。
 */
function safeSource(source: string): string {
  return source.replace(
    /<([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})>/g,
    (_, email: string) => `[${email}](mailto:${email})`
  );
}

/** 轻量 MDAST 遍历 */
function walkAst(node: unknown, visit: (n: any) => void) {
  if (!node || typeof node !== "object") return;
  const children = (node as { children?: unknown[] }).children;
  if (Array.isArray(children)) children.forEach((c) => walkAst(c, visit));
  visit(node);
}

/**
 * remark 插件：把 ```mermaid 代码块编译为 <Mermaid code="..." />。
 * 这样文章里直接写 mermaid 语法（时序图/流程图/类图…），客户端渲染成 SVG。
 */
function remarkMermaid() {
  return (tree: unknown) => {
    walkAst(tree, (node) => {
      if (node.type !== "code" || node.lang !== "mermaid") return;
      node.type = "mdxJsxFlowElement";
      node.name = "Mermaid";
      node.attributes = [
        { type: "mdxJsxAttribute", name: "code", value: node.value ?? "" },
      ];
      node.children = [];
      delete node.value;
      delete node.lang;
    });
  };
}

/** 把 MDX 字符串编译为 React 元素（服务端组件中 await 使用） */
export async function renderMDX(source: string) {
  const { content } = await compileMDX({
    source: safeSource(source),
    components: MDXComponents,
    options: {
      parseFrontmatter: false,
      mdxOptions: {
        remarkPlugins: [remarkGfm, remarkMermaid],
        rehypePlugins: [rehypeSlug],
      },
    },
  });
  return content;
}

export type TocItem = { level: 2 | 3; text: string; id: string };

/**
 * 从 MDX 源码提取 h2/h3 目录。
 * 用与 rehype-slug 相同的 github-slugger 生成 id，保证与渲染出的锚点一致；
 * 跳过代码块内的标题，并同步推进 slugger 状态（含 h1..h6）避免撞号。
 */
export function getToc(source: string): TocItem[] {
  const slugger = new GithubSlugger();
  const toc: TocItem[] = [];
  let inCode = false;

  for (const raw of source.split("\n")) {
    const trimmed = raw.trimStart();
    if (trimmed.startsWith("```")) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;

    const m = raw.match(/^(#{1,6})\s+(.+)$/);
    if (!m) continue;

    const level = m[1].length as 2 | 3;
    const text = m[2].replace(/[`*_[\]()]/g, "").trim();
    const id = slugger.slug(text);
    if (level === 2 || level === 3) toc.push({ level, text, id });
  }
  return toc;
}
