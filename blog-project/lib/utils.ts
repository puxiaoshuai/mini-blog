/** 日期格式化：2026.08.09（纸感 mono 风格） */
export function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

/** 合并类名（过滤 falsy） */
export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/** 阅读时长（分钟）：按正文长度估算，最少 1 分钟。发布时算好写入 Post.readingMinutes */
export function calcReadingMinutes(content: string): number {
  return Math.max(1, Math.round(content.length / 400));
}
