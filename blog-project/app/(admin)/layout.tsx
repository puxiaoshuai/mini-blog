import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";

/** (admin) 路由组守卫：仅 ADMIN 可进入，否则回登录页（服务端权威校验） */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <AdminShell user={session.user}>{children}</AdminShell>
  );
}
