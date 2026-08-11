/** 占位页：用于 M1 骨架中尚未实现的栏目，后续里程碑替换为真实页面 */
export default function Placeholder({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <section className="mx-auto max-w-6xl px-5 pt-16 md:pt-20">
      <div className="border-y-2 border-ink py-16 text-center md:py-20">
        <p className="eyebrow text-[10px] text-accent">COMING SOON</p>
        <h1 className="mt-4 font-serif text-4xl font-black md:text-5xl">
          {title}
        </h1>
        <p className="mt-5 font-serif text-lg text-inksoft">{desc}</p>
      </div>
    </section>
  );
}
