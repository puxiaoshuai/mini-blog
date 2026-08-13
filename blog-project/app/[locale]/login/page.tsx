"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, Link } from "@/i18n/navigation";

/** 管理端登录页（独立于 (blog) 布局，文案保持中文） */
export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      identifier,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("邮箱或密码不正确");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-5">
      <Link href="/" className="mb-10 block text-center">
        <p className="font-serif text-3xl font-black tracking-wide">大道至简</p>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[.3em] text-inksoft">
          Admin · Console
        </p>
      </Link>

      <div className="frame w-full border border-line bg-card p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="seal flex h-9 w-9 items-center justify-center bg-accent font-serif font-black text-paper">
            管
          </span>
          <div>
            <h1 className="font-serif text-xl font-black">后台登录</h1>
            <p className="font-mono text-[10px] tracking-[.25em] text-inksoft">
              ADMIN SIGN IN
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="identifier"
              className="mb-1.5 block font-mono text-[10px] tracking-[.2em] text-inksoft"
            >
              账号 / ACCOUNT
            </label>
            <input
              id="identifier"
              type="text"
              required
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="admin 或邮箱"
              className="h-10 w-full border border-line bg-paper px-3 font-mono text-sm placeholder:text-inksoft/60 focus:border-ink focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block font-mono text-[10px] tracking-[.2em] text-inksoft"
            >
              密码 / PASSWORD
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-10 w-full border border-line bg-paper px-3 font-mono text-sm focus:border-ink focus:outline-none"
            />
          </div>
          {error && <p className="font-mono text-xs text-accent">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="h-11 w-full bg-accent font-mono text-xs tracking-[.2em] text-paper transition-colors hover:bg-accentdeep disabled:opacity-60"
          >
            {loading ? "登录中…" : "登 录"}
          </button>
        </form>

        <p className="mt-6 text-center font-mono text-[10px] text-inksoft">
          仅管理员可进入后台
        </p>
      </div>
    </main>
  );
}
