import { handle } from "hono/vercel";
import app from "@/lib/hono/app";

// /api/* 全部交由 Hono 处理（NextAuth 的 /api/auth/[...nextauth] 更具体，优先匹配，不受影响）
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
