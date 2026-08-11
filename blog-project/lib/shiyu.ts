import { prisma } from "@/lib/db";

/** 拾语卡片（前台展示）：日期序列化为 ISO 字符串，配图解析为数组 */
export type ShiyuItem = {
  id: string;
  no: number;
  content: string;
  images: string[] | null;
  pinned: boolean;
  createdAt: string; // ISO
};

type ShiyuRow = {
  id: string;
  no: number;
  content: string;
  images: string | null;
  pinned: boolean;
  createdAt: Date;
};

/** 行 → 卡片：解 JSON 配图、日期转 ISO */
export function toShiyuItem(row: ShiyuRow): ShiyuItem {
  return {
    id: row.id,
    no: row.no,
    content: row.content,
    images: row.images ? (JSON.parse(row.images) as string[]) : null,
    pinned: row.pinned,
    createdAt: row.createdAt.toISOString(),
  };
}

/**
 * 已发布拾语流：置顶优先 + 时间倒序 + 分页。
 * 供 /shiyu 页（ISR）与 /api/shiyu 共用。
 */
export async function getShiyus({
  page = 1,
  pageSize = 10,
}: { page?: number; pageSize?: number } = {}) {
  const skip = (page - 1) * pageSize;
  const [total, rows] = await Promise.all([
    prisma.shiyu.count({ where: { published: true } }),
    prisma.shiyu.findMany({
      where: { published: true },
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
      skip,
      take: pageSize,
    }),
  ]);
  const items = rows.map(toShiyuItem);
  return { items, total, page, pageSize, hasMore: skip + items.length < total };
}

/** 单条拾语（仅已发布），公开接口用 */
export async function getShiyuById(id: string): Promise<ShiyuItem | null> {
  const row = await prisma.shiyu.findFirst({ where: { id, published: true } });
  return row ? toShiyuItem(row) : null;
}

/** 页头台账：累计条数 / 起始日期 / 最近更新 */
export async function getShiyuMeta() {
  const [count, agg] = await Promise.all([
    prisma.shiyu.count({ where: { published: true } }),
    prisma.shiyu.aggregate({
      _min: { createdAt: true },
      _max: { createdAt: true },
      where: { published: true },
    }),
  ]);
  return {
    count,
    firstDate: agg._min.createdAt ?? null,
    lastDate: agg._max.createdAt ?? null,
  };
}

/** 新建拾语时自动续号（max(no) + 1） */
export async function getNextShiyuNo(): Promise<number> {
  const agg = await prisma.shiyu.aggregate({ _max: { no: true } });
  return (agg._max.no ?? 0) + 1;
}
