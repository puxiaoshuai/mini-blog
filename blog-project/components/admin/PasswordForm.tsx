"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

/** 修改密码表单（调 /api/account/password）；成功后强制重新登录刷新 JWT 会话 */
export default function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("两次输入的新密码不一致");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "修改失败");
        return;
      }
      setDone(true);
      // 密码已变更，登出并回到前台首页
      setTimeout(() => signOut({ callbackUrl: "/" }), 2000);
    } catch {
      setError("网络错误，请稍后再试");
    } finally {
      setBusy(false);
    }
  }

  const inputCls =
    "h-10 w-full border border-line bg-paper px-3 font-mono text-sm focus:border-ink focus:outline-none";

  if (done) {
    return (
      <div className="border border-line bg-card p-6">
        <h2 className="font-serif text-lg font-black">密码已修改</h2>
        <p className="mt-0.5 font-mono text-[10px] text-inksoft">PASSWORD CHANGED</p>
        <p className="mt-4 font-mono text-xs text-inksoft">
          正在返回首页，下次登录请使用新密码…
        </p>
      </div>
    );
  }

  return (
    <section className="border border-line bg-card p-6">
      <h2 className="font-serif text-lg font-black">修改密码</h2>
      <p className="mt-0.5 font-mono text-[10px] text-inksoft">CHANGE PASSWORD</p>
      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <div>
          <label
            htmlFor="currentPassword"
            className="mb-1.5 block font-mono text-[10px] tracking-[.2em] text-inksoft"
          >
            当前密码 / CURRENT
          </label>
          <input
            id="currentPassword"
            type="password"
            required
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label
            htmlFor="newPassword"
            className="mb-1.5 block font-mono text-[10px] tracking-[.2em] text-inksoft"
          >
            新密码 / NEW（至少 8 位）
          </label>
          <input
            id="newPassword"
            type="password"
            required
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1.5 block font-mono text-[10px] tracking-[.2em] text-inksoft"
          >
            确认新密码 / CONFIRM
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputCls}
          />
        </div>
        {error && <p className="font-mono text-xs text-accent">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="h-10 bg-accent px-6 font-mono text-xs tracking-[.15em] text-paper transition-colors hover:bg-accentdeep disabled:opacity-60"
        >
          {busy ? "提交中…" : "确认修改"}
        </button>
      </form>
    </section>
  );
}
