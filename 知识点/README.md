# 知识点 · 从 0 到 1 搭建个人博客

> 以 `blog-project`（大道至简博客）为实例，逐节拆解 Next.js 16 全栈博客的核心技术。
> 每节一个文件，写成博客可直接粘贴。

## 技术栈总览

| 层 | 技术 | 项目位置 |
|---|---|---|
| 框架 | Next.js 16 (App Router) + React 19 + TypeScript | `app/` |
| 样式 | Tailwind CSS v4 | `app/globals.css` |
| 数据库 | PostgreSQL + Prisma 7 | `prisma/schema.prisma`, `lib/db.ts` |
| API 层 | Hono（挂载于 Route Handler） | `app/api/[[...route]]/route.ts`, `lib/hono/*` |
| 认证 | NextAuth v4（凭证 + JWT + role） | `lib/auth.ts` |
| 国际化 | next-intl（`/zh` `/en`） | `i18n/*` |
| 内容 | MDX（next-mdx-remote + remark/rehype） | `lib/mdx.ts` |
| 部署 | 宝塔 Nginx + PM2；Docker 仅本地 DB | `DEPLOY.md`, `docker-compose.yml` |

## 大纲

| 节 | 主题 | 文件 | 状态 |
|---|---|---|---|
| 0 | 项目概览与技术选型 | `00-项目概览.md` | ✅ |
| 1 | 项目搭建 | `01-项目搭建.md` | ✅ |
| 2 | 数据层：Prisma 7 | `02-Prisma7数据层.md` | ✅ |
| 3 | API 层：Route Handler + Hono | `03-RouteHandler与Hono.md` | ✅ |
| 4 | 认证：NextAuth | `04-NextAuth认证.md` | ✅ |
| 5 | 渲染策略：SSG / ISR / SSR | `05-渲染策略.md` | ✅ |
| 6 | 国际化：next-intl | `06-next-intl国际化.md` | ✅ |
| 7 | MDX 内容渲染 | `07-MDX内容渲染.md` | ✅ |
| 8 | 限流与安全 | `08-限流与安全.md` | ✅ |
| 9 | SEO | `09-SEO优化.md` | ✅ |
| 10 | 部署运维 | `10-部署运维.md` | ✅ |

## 学习主线

```
搭建 → 数据 → API → 认证 → 渲染 → 国际化 → 内容 → 安全 → SEO → 部署
```

一条主线讲透：**数据怎么存（Prisma）→ 接口怎么给（Hono）→ 权限怎么管（NextAuth）→ 页面怎么渲（SSG/ISR）→ 内容怎么读（MDX）→ 怎么上线（宝塔）**。
