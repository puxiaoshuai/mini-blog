# 第 4 节 · 认证：NextAuth

> 博客有「前台公开 / 后台管理」两套面。后台要用凭证登录，还要区分普通用户和管理员。
> 这一节讲 NextAuth v4 的凭证登录、JWT session、role 注入，以及「页面级 + API 级」双防线。

---

## 一、整体设计

- 登录方式：**用户名 / 邮箱 + 密码**（凭证登录），密码用 bcrypt 哈希存储。
- Session：**JWT 策略**（无状态，服务器不用存 session）。
- 权限：`User.role`（`USER` / `ADMIN`）在登录时进 JWT，前后端都能读到。
- 双防线：
  1. **页面级** —— `(admin)/layout.tsx` 进后台前服务端校验；
  2. **API 级** —— 每个写接口 handler 里 `requireAdmin()` 再查一遍。

## 二、NextAuth 配置（lib/auth.ts）

```ts
export const authOptions: NextAuthOptions = {
  pages: { signIn: "/login" },          // 自定义登录页
  session: { strategy: "jwt" },         // JWT 无状态 session
  secret: process.env.NEXTAUTH_SECRET,  // 生产必配
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        identifier: { label: "账号", type: "text" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        const identifier = credentials?.identifier?.trim();
        const password = credentials?.password;
        if (!identifier || !password) return null;

        // 支持「账号(username) 或 邮箱」登录
        const user = await prisma.user.findFirst({
          where: { OR: [{ email: identifier }, { username: identifier }] },
        });
        if (!user || !user.password) return null;

        // bcrypt 比对哈希
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name, image: user.image, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "USER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) ?? "USER";
      }
      return session;
    },
  },
};
```

### 关键机制拆解

**1. `authorize` 是整个登录的核心**：查库 → bcrypt 比对 → 返回用户对象。
- 密码绝不存明文，库里是 `bcrypt.hash` 后的串，比对用 `bcrypt.compare`。
- `identifier` 支持邮箱或用户名两种输入，`OR` 条件一条查询搞定。
- 返回 `null` = 登录失败。

**2. JWT + callbacks 是 role 的搬运通道**：
- `authorize` 返回的用户对象 → `jwt` callback 在**首次登录**时把 `id` / `role` 写进 JWT；
- 之后每次请求解码 JWT → `session` callback 把 `id` / `role` 从 token 搬到 `session.user` 上。

于是服务端 `getServerSession(authOptions)` 拿到的 `session.user` 里就有 `role` 了。

### 类型扩展

TS 里 `session.user.role` 不是默认字段，需要声明类型扩展（项目在 `types/next-auth.d.ts` 或 `next-env` 区域做）：

```ts
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
}
```

## 三、API 路由挂载

```ts
// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

## 四、页面级守卫：路由组 layout

`(admin)` 是路由组，它的 `layout.tsx` 包裹所有后台页。**在服务端（Server Component）校验**，未登录/非 ADMIN 直接重定向登录页：

```tsx
export default async function AdminLayout({ children, params }) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect({ href: "/login", locale });  // 走 i18n 封装，自动带 /zh /en
    return null;
  }
  return <AdminShell user={session.user}>{children}</AdminShell>;
}
```

> 这里的核心思想：**进入后台这个"目录"之前先查身份**。就算有人直接输 `/zh/dashboard` 的 URL，也会在 layout 层被拦下——不依赖前端按钮是否显示。

## 五、API 级守卫：requireAdmin

页面守卫管"看得见"，API 守卫管"改得动"。所有写接口里再查一次：

```ts
export async function requireAdmin(): Promise<{ userId: string } | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return { userId: session.user.id };
}
```

用法（Hono handler 里）：
```ts
const session = await requireAdmin();
if (!session) return c.json({ error: "未登录或权限不足" }, 401);
// 后面用 session.userId 作为 authorId 写入
```

返回值还顺便解决了「新建文章要 authorId」的问题——守卫返回当前管理员 id，直接当外键用。

> 为什么 API 还要再查一次？页面级守卫只保护 UI 目录；**接口是独立入口**，任何人可绕过页面直接 `POST /api/posts`。后端永远不要信任前端，写操作必须自己鉴权。

## 六、前端登录页

`login/page.tsx`（client component）用 `next-auth/react` 的 `signIn`：

```tsx
const res = await signIn("credentials", {
  identifier,
  password,
  redirect: false,          // 不让 NextAuth 跳页，自己控制跳转
});
if (res?.error) { setError("邮箱或密码不正确"); return; }
router.push("/dashboard");  // 成功进后台
router.refresh();           // 刷新服务端组件（让 layout 守卫重跑、Header 显示登录态）
```

`redirect: false` 很关键：否则 NextAuth 会 302 跳转，拿不到 JSON 错误信息，也无法自定义跳转目标。

## 七、创建管理员（seed 里）

后台没有注册入口，管理员在 seed 脚本里创建，密码走 bcrypt：

```ts
await prisma.user.create({
  data: {
    email: "admin@example.com",
    username: "admin",
    password: await bcrypt.hash("你的强密码", 10),
    role: "ADMIN",
  },
});
```

## 八、本节小结

- **凭证登录**：`authorize` 查库 + `bcrypt.compare`，密码只存哈希。
- **JWT + callbacks**：登录时把 `id/role` 写进 token，请求时搬到 `session.user`。
- **双防线**：`(admin)` layout 拦页面访问，`requireAdmin()` 拦 API 写操作，后者顺便提供 `authorId`。
- **前端**：`signIn(..., { redirect: false })` + 自行跳转 + `router.refresh()`。
- **无注册入口**：管理员 seed 创建。

下一节：**渲染策略 —— SSG / ISR / SSR 怎么选，revalidatePath 怎么增量刷新**。
