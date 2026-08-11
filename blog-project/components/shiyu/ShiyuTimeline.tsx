import Image from "next/image";
import { formatDate } from "@/lib/utils";

/** 拾语卡片数据（与 lib/shiyu.ts 的 ShiyuItem 一致，组件侧自带以解耦） */
export type ShiyuItem = {
  id: string;
  no: number;
  content: string;
  images: string[] | null;
  pinned: boolean;
  createdAt: string; // ISO
};

/**
 * 节点圆点配色（对照 design/shiyu.html）：
 * 前 5 条朱红 → 中间 3 条金 → 其余青灰。按全局序号取色，翻页不跳色。
 */
const DOT_TIERS: Array<{ until: number; cls: string }> = [
  { until: 5, cls: "bg-accent" },
  { until: 8, cls: "bg-gold" },
  { until: Infinity, cls: "bg-sage" },
];

function dotColor(globalIndex: number) {
  return DOT_TIERS.find((t) => globalIndex < t.until)?.cls ?? "bg-sage";
}

/**
 * 拾语时间线条目（<li>）。
 * startIndex = 本批第一条在完整流中的序号，保证「加载更多」后圆点配色连续。
 */
export default function ShiyuTimeline({
  items,
  startIndex = 0,
}: {
  items: ShiyuItem[];
  startIndex?: number;
}) {
  if (!items.length) return null;

  return (
    <>
      {items.map((item, i) => {
        const idx = startIndex + i;
        return (
          <li
            key={item.id}
            className="reveal relative pl-8 pb-12"
            style={{ animationDelay: `${(idx % 10) * 0.05}s` }}
          >
            {/* 时间线节点 */}
            <span
              className={`absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full ring-4 ring-paper ${dotColor(idx)}`}
            />

            <div className="grid gap-x-8 gap-y-3 lg:grid-cols-12">
              {/* 左：日期 / 编号 / 置顶 */}
              <div className="lg:col-span-3 lg:pt-1.5 lg:text-right">
                <p className="font-mono text-[11px] text-inksoft">
                  {formatDate(item.createdAt)}
                </p>
                <p className="mt-1 font-mono text-[10px] text-inksoft">
                  N°{String(item.no).padStart(3, "0")}
                </p>
                {item.pinned && <span className="chip chip-accent mt-3">置顶</span>}
              </div>

              {/* 右：一句话 + 配图 */}
              <div className="lg:col-span-9">
                <p className="font-serif text-lg leading-loose md:text-xl">
                  {item.content}
                </p>
                {item.images?.length ? (
                  <figure className="mt-5 max-w-xl">
                    <div className="frame relative aspect-[16/9] overflow-hidden border border-ink/25 bg-card">
                      <Image
                        src={item.images[0]}
                        alt={item.content}
                        fill
                        sizes="(max-width: 768px) 100vw, 576px"
                        className="object-cover"
                      />
                      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-ink/10" />
                    </div>
                    <figcaption className="mt-2.5 font-mono text-[11px] text-inksoft">
                      配图 · {formatDate(item.createdAt)}
                    </figcaption>
                  </figure>
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
    </>
  );
}
