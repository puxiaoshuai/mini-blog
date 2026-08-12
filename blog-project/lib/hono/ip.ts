import type { Context } from "hono";

/** 取客户端真实 IP（宝塔 = Nginx 反代，按可信度逐级尝试）
 *  - cf-connecting-ip：Cloudflare 专用头（仅在有 CF 时可信，直连可伪造）
 *  - x-real-ip：Nginx 用 $remote_addr 直填，客户端伪造不了，无 CDN 时最可信
 *  - x-forwarded-for 取最右：Nginx 用 $proxy_add_x_forwarded_for「追加」直连 IP，
 *    最右一段 = Nginx 看到的真实对端；最左可被客户端伪造，绝不能取首段
 */
export function getClientIp(c: Context): string | null {
  const cf = c.req.header("cf-connecting-ip");
  if (cf) return cf.trim();
  const real = c.req.header("x-real-ip");
  if (real) return real.trim();
  const fwd = c.req.header("x-forwarded-for");
  if (fwd) {
    const parts = fwd.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }
  return null;
}
