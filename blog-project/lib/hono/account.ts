import { Hono } from "hono";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

type PasswordBody = {
  currentPassword?: string;
  newPassword?: string;
};

/** 账号路由（挂载于 /account，app.basePath('/api') 后即 /api/account） */
export const account = new Hono()
  // POST /api/account/password — 修改当前管理员密码（ADMIN）
  .post("/password", async (c) => {
    const session = await requireAdmin();
    if (!session) {
      return c.json({ error: "未登录或权限不足" }, 401);
    }

    let body: PasswordBody;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "请求体不是合法 JSON" }, 400);
    }

    const currentPassword = body.currentPassword;
    const newPassword = body.newPassword;
    if (!currentPassword || !newPassword) {
      return c.json({ error: "请填写当前密码和新密码" }, 400);
    }
    if (newPassword.length < 8) {
      return c.json({ error: "新密码至少 8 位" }, 400);
    }
    if (newPassword.length > 72) {
      return c.json({ error: "新密码不能超过 72 位" }, 400);
    }
    if (newPassword === currentPassword) {
      return c.json({ error: "新密码不能与当前密码相同" }, 400);
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user || !user.password) {
      return c.json({ error: "账号状态异常" }, 400);
    }

    // 校验当前密码，防止会话被冒用时改密
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return c.json({ error: "当前密码不正确" }, 400);
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: session.userId },
      data: { password: hashed },
    });

    return c.json({ ok: true });
  });
