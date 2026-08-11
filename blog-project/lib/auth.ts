/**
 * 管理端权限守卫 · M3 占位。
 *
 * M4 接入 NextAuth 后替换为真实 session 校验：
 *   const session = await getServerSession(authOptions);
 *   if (session?.user.role !== "ADMIN") return null;
 *   return { userId: session.user.id };
 *
 * 当前恒返回 null → 写操作一律 401，前台不受影响。
 */
export async function requireAdmin(): Promise<{ userId: string } | null> {
  // TODO(M4): getServerSession + role === ADMIN 校验
  return null;
}
