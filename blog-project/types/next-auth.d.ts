import type { DefaultSession } from "next-auth";

/** 扩展 next-auth 类型：Session.user 注入 id / role，User 带 role */
declare module "next-auth" {
  interface User {
    role?: string;
  }
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
  }
}
