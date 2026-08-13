import { withAuth } from "next-auth/middleware";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/**
 * Next.js 16：middleware 更名为 proxy，功能一致。
 *
 * 组合两层：
 * 1. next-auth 鉴权 —— /dashboard 未登录一律重定向登录页（角色校验在 (admin) 布局里做）；
 * 2. next-intl 语言路由 —— /zh、/en 前缀探测，未带前缀按浏览器语言重定向。
 *
 * authorized 返回 true（公开页 / 已登录的受保护页）时才继续跑 intlMiddleware；
 * 未登录访问 dashboard 时 withAuth 直接 302 到 /login（随后 intlMiddleware 补上语言前缀）。
 */
const intlMiddleware = createMiddleware(routing);

const authMiddleware = withAuth(
  function onMiddleware(req) {
    return intlMiddleware(req);
  },
  {
    pages: { signIn: "/login" },
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        // 去掉语言前缀后判断是否受保护（/dashboard 及其子路径）
        const path = pathname.replace(/^\/(?:zh|en)\b/, "") || "/";
        return path.startsWith("/dashboard") ? Boolean(token) : true;
      },
    },
  }
);

export default authMiddleware;

export const config = {
  // 排除：API、Next 内部、robots/sitemap、静态资源。旧链接（/posts、/dashboard）不带前缀时自动重定向到 /zh 或 /en。
  matcher: ["/((?!api|_next|_vercel|robots|sitemap|.*\\..*).*)"],
};
