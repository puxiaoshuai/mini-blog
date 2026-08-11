# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

「大道至简」个人博客：从 WordPress（puxiaoshuai.top，Qzdy 主题）迁移到 Next.js 全栈。代码在 `blog-project/`；仓库根目录放文档与设计稿。

## 工作目录与命令

> 约定：所有命令在 `blog-project/` 下执行（`cd F:\mini-blog\blog-project`）。

| 命令 | 说明 |
|---|---|
| `npm run dev` | 开发服务器（Next 16 + Turbopack） |
| `npm run build` / `npm run start` | 构建 / 生产运行 |
| `npm run lint` | ESLint |
| `docker compose up -d` | 启动本地 PostgreSQL（`127.0.0.1:5432`） |
| `npx prisma migrate dev --name <描述>` | schema 变更后生成并应用迁移 |
| `npx prisma generate` | 重新生成 Prisma client（migrate 后 client 可能不刷新） |
| `npx prisma db seed` | 播种数据（admin + 10 拾语 + 2 文章 + 2 标签，可重复执行） |
| `npm run db:studio` | Prisma Studio 可视化 |

首次初始化：`docker compose up -d` → `npx prisma migrate dev --name init` → `npx prisma db seed`。

## 里程碑工作流

- 任务进度见根目录《任务清单.md》（M1–M6），每完成一步勾选 ✅。
- 每步核心知识点记入《知识点.md》——**先查这里，已踩过的坑不要重踩**。
- 技术决策 / API 设计见《技术方案.md》；高保真设计稿在 `design/*.html`（拾语页对照 `design/shiyu.html` 验收）。
- 用户以中文沟通。

## 架构要点

- **Next.js 16.3（App Router）**：`app/(blog)` 前台路由组（TopBar / Header / Footer 共享布局）；`app/(admin)` 后台路由组（M4 起）；`app/api/**` Route Handlers。
- **渲染策略**：文章列表/详情/标签 = SSG（`generateStaticParams`）；拾语 `/shiyu` = ISR；管理端 = 动态。未启用 Cache Components，ISR 用旧模型 `export const revalidate = <秒>`。
- **数据层**：Prisma 7 + PostgreSQL（本地 Docker，driver adapter `PrismaPg`，client 生成到 `lib/generated/prisma`）。**文章内容以 DB 为准**：`Post.content` 存 MDX 字符串，不另设 `content/*.mdx` 文件。
- **MDX**：`next-mdx-remote` v6 `compileMDX`（服务端），自定义组件在 `components/posts/MDXComponents.tsx`（首字下沉 / 引文 / 代码块 / 表格）。
- **查询方式**：前台页面直接 `await` Prisma 查询（`lib/posts.ts`、`lib/shiyu.ts`），不经 API；API 只服务于动态交互。
- **认证（M4 起）**：NextAuth 凭证登录 + bcrypt，写操作统一 `requireAdmin()`（`lib/auth.ts`）校验 `session.user.role === ADMIN`。M3 阶段该函数为占位，写操作恒 401，M4 接入真实 session。

## 关键约定与坑（详见《知识点.md》）

- **Next 16 破坏性变更**：动态路由 `params` 是 Promise，必须 `await params`（页面与 Route Handler 都是）。改代码前看 `node_modules/next/dist/docs/`（`blog-project/AGENTS.md` 亦有此提示）。
- **设计系统「纸感编辑风」**：暖纸 `#F6F1E7` / 墨黑 / 朱红 `#A63D2F`；token 是 `rgb(r g b)` CSS 变量（`:root` + `html.dark` 两套），Tailwind 颜色类自动跟随翻转、**无需 `dark:` 变体**；反色带用 `bg-night text-nighttext`（恒定不翻转）。字体：Noto Serif SC（标题）/ Noto Sans SC（正文）/ IBM Plex Mono（mono 编号、日期），@fontsource 自托管（国内不可达 Google Fonts）。
- **Tailwind v4**：无 `tailwind.config.js`，配置全在 `app/globals.css` 的 `@theme inline`。
- **DB 连接**：Windows 下必须用 `127.0.0.1` 而非 `localhost`（IPv6 loopback 会连到 wslrelay 导致 P1001 超时）。
- **进度（2026-08-11）**：M1 基建 + M2 内容模块 + **M3 拾语模块**已完成（`/shiyu` ISR 时间线 + `/api/shiyu`，写操作经 `lib/auth.ts` 的 `requireAdmin()` 占位守卫，M4 接 NextAuth 后启用）。M4 管理端 / M5 打磨 / M6 上线待做。
