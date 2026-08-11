import { withAuth } from "next-auth/middleware";

// Next.js 16：middleware 更名为 proxy，功能一致。
// 未登录访问 /dashboard 一律重定向 /login（角色校验在 (admin) 布局里做）。
export default withAuth({
  pages: { signIn: "/login" },
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
