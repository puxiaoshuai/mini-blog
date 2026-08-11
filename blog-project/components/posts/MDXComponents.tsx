import type { ComponentProps } from "react";

/** 纸感编辑风 · MDX 自定义组件（正文排版） */

function H1(props: ComponentProps<"h1">) {
  return <h1 {...props} className="mb-8 mt-2 font-serif text-3xl font-black" />;
}

function H2(props: ComponentProps<"h2">) {
  return (
    <h2
      {...props}
      className="mb-5 mt-14 scroll-mt-24 border-b border-line pb-3 font-serif text-2xl font-bold"
    />
  );
}

function H3(props: ComponentProps<"h3">) {
  return (
    <h3 {...props} className="mb-4 mt-10 scroll-mt-24 font-serif text-xl font-bold" />
  );
}

function P(props: ComponentProps<"p">) {
  return <p {...props} className="my-5 text-[15px] leading-[1.9]" />;
}

function A(props: ComponentProps<"a">) {
  return (
    <a
      {...props}
      className="text-accent underline decoration-line underline-offset-4 transition-colors hover:text-accentdeep"
    />
  );
}

function UL(props: ComponentProps<"ul">) {
  return <ul {...props} className="my-5 list-disc space-y-2 pl-6 marker:text-accent" />;
}

function OL(props: ComponentProps<"ol">) {
  return <ol {...props} className="my-5 list-decimal space-y-2 pl-6 marker:text-accent" />;
}

function LI(props: ComponentProps<"li">) {
  return <li {...props} className="leading-[1.9]" />;
}

function Blockquote(props: ComponentProps<"blockquote">) {
  return (
    <blockquote
      {...props}
      className="my-8 border-l-2 border-accent pl-5 font-serif text-lg leading-loose text-inksoft"
    />
  );
}

function Code(props: ComponentProps<"code">) {
  const isBlock = props.className?.includes("language-");
  if (isBlock) return <code {...props} />;
  return (
    <code
      {...props}
      className="rounded-sm bg-paper2 px-1.5 py-0.5 font-mono text-[0.88em] text-accentdeep"
    />
  );
}

function Pre(props: ComponentProps<"pre">) {
  return (
    <pre
      {...props}
      className="my-6 overflow-x-auto border border-line bg-night p-5 font-mono text-[13px] leading-relaxed text-nighttext"
    />
  );
}

function Table(props: ComponentProps<"table">) {
  return (
    <div className="my-8 overflow-x-auto">
      <table {...props} className="w-full border-collapse text-sm" />
    </div>
  );
}

function THead(props: ComponentProps<"thead">) {
  return (
    <thead
      {...props}
      className="bg-paper2 font-mono text-[11px] uppercase tracking-[.15em] text-inksoft"
    />
  );
}

function Th(props: ComponentProps<"th">) {
  return <th {...props} className="border border-line px-3 py-2 text-left" />;
}

function Td(props: ComponentProps<"td">) {
  return <td {...props} className="border border-line px-3 py-2 align-top" />;
}

function Img(props: ComponentProps<"img">) {
  // MDX 正文图宽高未知，无法用 next/image fill；懒加载 + 边框即可
  // 注：alt 由 MDX 作者在正文里提供，经 props 传入，故此处两条规则都豁免
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  return <img {...props} loading="lazy" className="my-8 w-full border border-line" />;
}

function Hr(props: ComponentProps<"hr">) {
  return <hr {...props} className="my-10 border-line" />;
}

function Strong(props: ComponentProps<"strong">) {
  return <strong {...props} className="font-bold text-ink" />;
}

function Em(props: ComponentProps<"em">) {
  return <em {...props} />;
}

const MDXComponents = {
  h1: H1,
  h2: H2,
  h3: H3,
  p: P,
  a: A,
  ul: UL,
  ol: OL,
  li: LI,
  blockquote: Blockquote,
  code: Code,
  pre: Pre,
  table: Table,
  thead: THead,
  th: Th,
  td: Td,
  img: Img,
  hr: Hr,
  strong: Strong,
  em: Em,
};

export default MDXComponents;
