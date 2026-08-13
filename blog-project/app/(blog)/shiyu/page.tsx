import type { Metadata } from "next";
import { getShiyus, getShiyuMeta } from "@/lib/shiyu";
import { formatDate } from "@/lib/utils";
import ShiyuStream from "@/components/shiyu/ShiyuStream";

// ISR：拾语高频更新，60s 增量重验证（旧模型，未启用 Cache Components）
export const revalidate = 60;

export const metadata: Metadata = { title: "拾语" };

const PAGE_SIZE = 10;

export default async function ShiyuPage() {
  const [firstPage, meta] = await Promise.all([
    getShiyus({ page: 1, pageSize: PAGE_SIZE }),
    getShiyuMeta(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-5">
      {/* ═══ 页头标题区 ═══ */}
      <section className="border-b-2 border-ink pb-10 pt-12 md:pt-16">
        <div className="mb-6 flex items-center gap-4">
          <span className="seal flex h-9 w-9 items-center justify-center bg-accent font-serif font-black text-nighttext">
            语
          </span>
          <span className="eyebrow text-[11px] text-inksoft">
            拾语 · COLLECTED WORDS
          </span>
          <span className="hidden font-mono text-[10px] tracking-[.25em] text-inksoft sm:inline">
            POST_TYPE · WEIYU
          </span>
        </div>

        <div className="grid items-end gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <h1 className="ink-wipe font-serif text-5xl font-black leading-none md:text-7xl">
              拾语
            </h1>
            <p className="mt-6 max-w-2xl font-serif text-lg leading-relaxed text-inksoft md:text-xl">
              一句话，或一句话加一张图。是随手捡起的光，攒在时间的线上——回头才看得清流向。
            </p>
          </div>
          <div className="font-mono text-[11px] leading-loose text-inksoft lg:col-span-4 lg:text-right">
            <p>累计 · {meta.count} 条</p>
            <p>起始 · {meta.firstDate ? formatDate(meta.firstDate) : "—"}</p>
            <p>更新 · {meta.lastDate ? formatDate(meta.lastDate) : "—"}</p>
          </div>
        </div>
      </section>

      {/* ═══ 拾语流 · 时间线 ═══ */}
      <section className="mt-12">
        <div className="mb-2 flex items-center gap-3">
          <h2 className="font-serif text-xl font-black">拾语流</h2>
          <span className="pt-1 font-mono text-[10px] tracking-[.25em] text-inksoft">
            MOMENTS · 最近 {PAGE_SIZE} 条
          </span>
          <div className="h-px flex-1 bg-line" />
        </div>

        <ShiyuStream
          initialItems={firstPage.items}
          total={firstPage.total}
          pageSize={PAGE_SIZE}
        />
      </section>

      {/* ═══ 发布带 · 集邮簿 ═══ */}
      <section className="relative mt-20 overflow-hidden bg-night text-nighttext">
        <div className="px-8 py-16 text-center md:py-24">
          <p className="eyebrow text-[10px] text-gold">
            拾语 · 发布 · WRITE TO ME
          </p>

          <div className="mt-10 flex items-center justify-center gap-5">
            <div className="h-px w-16 bg-nighttext/30 md:w-28" />
            <span className="seal flex h-11 w-11 items-center justify-center bg-accent font-serif font-black text-nighttext">
              语
            </span>
            <div className="h-px w-16 bg-nighttext/30 md:w-28" />
          </div>

          <h2 className="mx-auto mt-10 max-w-2xl font-serif text-3xl font-black leading-[1.6] md:text-4xl">
            捡起的，不只是句子，更是当时的光。
          </h2>

          <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-nighttext/70">
            一条一条地攒，像集邮。也欢迎来信——把你想说的话，留给我捡起来。
          </p>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <span className="font-mono text-[11px] tracking-[.25em] text-nighttext/60">
              来信 →
            </span>
            <a
              href="mailto:1372553910@qq.com"
              className="border border-nighttext/60 px-8 py-3.5 font-mono text-xs tracking-[.2em] transition-colors duration-300 hover:bg-nighttext hover:text-night"
            >
              1372553910@qq.com
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
