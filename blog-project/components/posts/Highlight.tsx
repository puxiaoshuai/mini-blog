/** 命中关键词高亮（大小写不敏感，只标首个命中位置，React 自动转义） */
export default function Highlight({ text, q }: { text: string; q: string }) {
  const kw = q.trim();
  if (!kw) return <>{text}</>;
  const i = text.toLowerCase().indexOf(kw.toLowerCase());
  if (i === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-accent/15 px-1 text-accent">
        {text.slice(i, i + kw.length)}
      </mark>
      {text.slice(i + kw.length)}
    </>
  );
}
