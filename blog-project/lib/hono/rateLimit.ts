/**
 * 进程内滑动窗口限流（按 key）。
 *
 * 注意：这是单实例内存实现——本地 / 单机 Docker 部署下可靠；
 * Vercel 等 serverless 多实例下为「尽力而为」，硬限流需换 Redis / DB 表。
 * 阅/赞前端已有会话去重（sessionStorage），这里只是服务端防线，够用即可。
 */

const buckets = new Map<string, number[]>();

/** 允许则返回 0；被限则返回需等待的秒数（≥1） */
export function checkRateLimit(key: string, windowMs: number, max: number): number {
  const now = Date.now();
  // 只保留窗口内的历史，顺便防 Map 膨胀
  const list = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);

  if (list.length >= max) {
    buckets.set(key, list);
    return Math.max(1, Math.ceil((windowMs - (now - list[0])) / 1000));
  }
  list.push(now);
  buckets.set(key, list);
  return 0;
}
