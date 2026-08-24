import PasswordForm from "@/components/admin/PasswordForm";

export const metadata = { title: "设置" };

/** 后台设置页：账号安全（修改密码） */
export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <h1 className="font-serif text-2xl font-black">设置</h1>
        <span className="pt-1 font-mono text-[10px] tracking-[.25em] text-inksoft">
          SETTINGS
        </span>
      </header>
      <div className="max-w-md">
        <PasswordForm />
      </div>
    </div>
  );
}
