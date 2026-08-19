/**
 * 站点对外 URL（metadataBase / OG / sitemap / robots 等构建期拼接统一走这里）。
 *
 * 生产环境请在部署平台（Vercel → Settings → Environment Variables）设置
 * `NEXT_PUBLIC_SITE_URL`，例如 https://www.your-domain.com；
 * 未设置时回退到默认域名（历史域名），保证本地开发零配置可跑。
 *
 * NEXT_PUBLIC_ 前缀：构建期注入，服务端/客户端都能读到（当前仅服务端使用）。
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.SITE_URL ??
  "https://www.puxiaoshuai.top"
).replace(/\/+$/, "");
