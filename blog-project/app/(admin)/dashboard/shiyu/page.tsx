import { getAdminShiyus } from "@/lib/admin";
import ShiyuAdmin, { type AdminShiyu } from "@/components/admin/ShiyuAdmin";

export const metadata = { title: "拾语管理" };

export default async function AdminShiyuPage() {
  const shiyus = await getAdminShiyus();
  const items: AdminShiyu[] = shiyus.map((s) => ({
    id: s.id,
    no: s.no,
    content: s.content,
    images: s.images ? (JSON.parse(s.images) as string[]) : null,
    pinned: s.pinned,
    published: s.published,
    createdAt: s.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <h1 className="font-serif text-2xl font-black">拾语管理</h1>
        <span className="pt-1 font-mono text-[10px] tracking-[.25em] text-inksoft">SHIYU</span>
      </header>
      <ShiyuAdmin items={items} />
    </div>
  );
}
