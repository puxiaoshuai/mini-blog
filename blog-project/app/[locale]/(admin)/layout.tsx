import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";
import { redirect } from "@/i18n/navigation";

/** (admin) 路由组守卫：仅 ADMIN 可进入，否则回登录页（服务端权威校验） */
export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect({ href: "/login", locale });
    return null; // redirect 返回类型为 never，此处显式退出以满足 TS 窄化
  }

  return (
    <AdminShell user={session.user}>{children}</AdminShell>
  );
}
