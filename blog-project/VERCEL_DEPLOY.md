# Vercel 部署图文指南（Next.js 16 + Prisma 7 + PostgreSQL）

> 本项目：**Next.js 16（App Router）+ Prisma 7 + PostgreSQL + next-auth + Hono**。
> 本文是给 Vercel 环境的完整部署教程（宝塔方案见 `DEPLOY.md`）。
> 官方参考：[Vercel KB: Next.js 16 + Prisma Postgres](https://vercel.com/kb/guide/nextjs-prisma-postgres) · [Neon: 从 Prisma 连接](https://neon.com/docs/guides/prisma) · [Prisma: Vercel 部署指南](https://www.prisma.io/docs/guides/postgres/vercel.md)

---

## 〇、整体架构（先看图）

```
┌──────────────┐   push    ┌────────────────────────────┐
│  GitHub 仓库  │ ────────▶ │         Vercel             │
│ blog-project │           │  ┌──────────────────────┐  │
└──────────────┘           │  │ 构建：prisma generate │  │
        │                  │  │      + next build     │  │
        │ 自动部署          │  │  （SSG 构建时查库！）  │  │
        │                  │  └──────────┬───────────┘  │
        ▼                  │             │ 运行时(函数)  │
┌──────────────┐           │             ▼              │
│ GitHub       │  migrate  │  ┌──────────────────────┐  │
│ Actions      │ ────────▶ │  │  Vercel Postgres     │  │
│ (工作流自动)  │  deploy   │  │  = Neon 托管的 PG     │  │
└──────────────┘           │  └──────────────────────┘  │
                           └────────────────────────────┘
```

**三条关键事实（决定部署顺序）：**

1. **博客页面是 SSG/ISR，`next build` 时会查数据库** → Vercel 构建环境必须能连上生产库。
2. **Prisma client 生成物 `lib/generated/prisma` 被 `.gitignore` 排除** → 必须靠 `package.json` 里的 `postinstall: prisma generate` 在装依赖时现场生成（Vercel 的自动检测在 Prisma 7 自定义 output 下不可靠，已实测失效，别依赖它）。
3. **迁移要单独跑，不能塞进 build** → 用 GitHub Actions 工作流（已配好 `.github/workflows/migrate-prod.yml`）或本地手动执行。

---

## 一、准备账号（5 分钟）

| 平台 | 用途 | 地址 |
|---|---|---|
| GitHub | 存放代码，Vercel 从这里导入 | github.com |
| Vercel | 托管部署 | vercel.com（可用 GitHub 账号一键登录） |
| Neon（或直接用 Vercel Postgres） | 托管 PostgreSQL | neon.tech |

> 本教程用 **Vercel Postgres**（Vercel 控制台里直接创建，底层就是 Neon，无需单独注册）。

---

## 二、第一步：创建 PostgreSQL 数据库

### 2.1 进入 Storage 页

登录 Vercel → 左侧菜单点 **Storage**（存储），看到如下页面：

```
┌──────────────────────────────────────────────────────┐
│  Storage                                             │
│  ┌────────────────────────────────────────────────┐  │
│  │  + Create Database            (右上角绿色按钮)   │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

点击右上角 **Create Database**（创建数据库）。

### 2.2 选择 Vercel Postgres

```
┌───────────────────────────────────────────────────┐
│  Create Database                                  │
│                                                   │
│   ○ Neon Postgres   ← Vercel Postgres 就是它      │
│   ○ Upstash Redis                                 │
│   ○ Blob                                          │
│   ...                                             │
│                                                   │
│  [Continue]                                       │
└───────────────────────────────────────────────────┘
```

选 **Postgres**，点 **Continue**。

### 2.3 命名并关联项目

- **Project**：选你的博客项目（或选 "No project yet" 稍后关联）
- **Database name**：如 `mini-blog-db`，选离你最近的区域（如 `Singapore`）
- 点 **Create**，等待约 1 分钟创建完成

### 2.4 拿连接串（最关键的一步！）

创建完成后进入数据库详情页 → **Quickstart / Connect** 标签，能看到两条连接串：

```
┌──────────────────────────────────────────────────────┐
│  Connection String                                   │
│                                                      │
│  DATABASE_URL (Pooled 连接池)  [Copy]  ★ 给应用用     │
│  postgresql://user:pass@ep-xxx-pooler.aws.neon.tech  │
│                      /neondb?sslmode=require         │
│                                                      │
│  DIRECT_URL (Direct 直连)      [Copy]  ★ 给迁移用     │
│  postgresql://user:pass@ep-xxx.aws.neon.tech         │
│                      /neondb?sslmode=require         │
└──────────────────────────────────────────────────────┘
```

> - 带 `-pooler` 的那条是**连接池地址** → 存为 `DATABASE_URL`，给应用运行时用（serverless 函数多实例下不耗尽连接）。
> - 不带 `-pooler` 的那条是**直连地址** → 存为 `DIRECT_URL`，只给 `prisma migrate deploy` / `db seed` 用。
> - 两条都复制保存好。如果 Vercel Postgres 已关联项目，这些变量其实会自动注入，但下面我们手动配置一遍更稳妥。
> - 官方说明：[Neon 的 pooled 连接串在哪找](https://neon.com/faqs/find-pooled-connection-string-dashboard) · [DATABASE_URL 在哪找](https://neon.com/faqs/find-database-url-neon)

---

## 三、第二步：配置 Vercel 环境变量

进入项目 → **Settings → Environment Variables**，添加 4 个变量（Production / Preview 都勾上）：

| 变量名 | 值 | 说明 |
|---|---|---|
| `DATABASE_URL` | `postgresql://...pooler...?sslmode=require` | 连接池地址（2.4 复制） |
| `NEXT_PUBLIC_SITE_URL` | `https://你的域名.com` | 站点 URL（metadataBase/sitemap/robots） |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` 生成 | 登录密钥，**必填** |
| `NEXTAUTH_URL` | `https://你的域名.com` | next-auth 回调地址，**必填**（不填预览也能跑，生产域名建议显式配置） |

```
┌──────────────────────────────────────────────────────────┐
│  Settings → Environment Variables                        │
│                                                          │
│  Key [DATABASE_URL________________]  Value [……]  [Add]  │
│  Key [NEXT_PUBLIC_SITE_URL_______]  Value [……]  [Add]  │
│  Key [NEXTAUTH_SECRET____________]  Value [……]  [Add]  │
│  Key [NEXTAUTH_URL_______________]  Value [……]  [Add]  │
│                                                          │
│  Environment: [☑ Production] [☑ Preview] [☐ Development] │
└──────────────────────────────────────────────────────────┘
```

> `DIRECT_URL` **不用**配给 Vercel——它只给迁移用，稍后配到 GitHub Secret 里。

---

## 四、第三步：从 GitHub 导入并部署

### 4.1 推送代码

```bash
cd blog-project
git init && git add . && git commit -m "init"
git remote add origin https://github.com/你的用户名/blog-project.git
git push -u origin main
```

### 4.2 导入项目

Vercel 首页 → **Add New → Project** → **Import Git Repository** → 选择你的仓库：

```
┌─────────────────────────────────────────────────────┐
│  Import Git Repository                              │
│  ┌───────────────────────────────────────────────┐  │
│  │  ☑ yourname/blog-project          [Import]   │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  配置（Configure Project）                          │
│  Root Directory : [blog-project ▼]   ★ 关键！       │
│  Framework      : Next.js（自动识别）               │
│  Build Command  : 留空（默认 next build）            │
│  Node.js Version: [22.x ▼]                         │
└─────────────────────────────────────────────────────┘
```

**两个关键设置：**

- **Root Directory 选 `blog-project`**（如果你把整个 `F:\mini-blog` 推上去了，必须选子目录，否则找不到 `package.json`）。
- **Node.js Version 选 `22.x`**（Next.js 16 要求 Node ≥ 20.9）。

点 **Deploy**。等待构建完成——**此时页面是 SSG，构建期会连数据库**，所以如果库没建好/变量没配，这里会失败，回头检查第二、三步。

> `package.json` 已配 `postinstall: prisma generate`——Vercel 执行 `npm ci` 时即自动生成，被 gitignore 的 `lib/generated/prisma` 无需担心，也不用改 Build Command。

---

## 五、第四步：初始化数据库（首次部署必做）

首次部署前，生产库还是空的（只有表结构迁移，没有数据）。**构建前必须先建表 + 灌种子**。

### 5.1 方式 A：本地跑（推荐首次）

在本地终端，把 `DATABASE_URL` 临时指向生产的**直连**地址：

```powershell
cd blog-project
$env:DATABASE_URL = "postgresql://user:pass@ep-xxx.aws.neon.tech/neondb?sslmode=require"
npx prisma migrate deploy   # 应用 prisma/migrations/ 下全部迁移（建表）
npx prisma db seed          # 灌入：admin/admin123、读者、2篇文章、10条拾语、3条评论
```

### 5.2 方式 B：交给 GitHub Actions（已配好）

仓库里已有 `.github/workflows/migrate-prod.yml`，但**首次**仍建议手动跑一次 5.1（保证 Vercel 第一次构建时表已就绪）。

---

## 六、第五步：配置 GitHub Secret（自动迁移用）

仓库 → **Settings → Secrets and variables → Actions → New repository secret**：

| Secret 名 | 值 |
|---|---|
| `DIRECT_URL` | 直连地址（2.4 复制的第二条） |

配置完成后，以后每次 push 到 `main` 且 `prisma/` 有变更，GitHub Actions 会自动对生产库执行 `migrate deploy`（不跑 seed）。

> ⚠️ 顺序提醒：push 会同时触发 Vercel 构建和迁移工作流。若 Vercel 构建先跑且本次有破坏性 schema 变更，构建可能失败——**在 Vercel 面板重新 Deploy 一次即可**（此时迁移已就位）。

---

## 七、第六步：绑定域名

项目 → **Settings → Domains → Add**：

```
┌──────────────────────────────────────────────────┐
│  Domains                                         │
│  [你的域名.com___________]  [Add]                │
│                                                  │
│  根据提示在 DNS 服务商加记录：                     │
│   子域名 www → CNAME → cname.vercel-dns.com      │
│   根域名    → A     → 76.76.21.21                │
└──────────────────────────────────────────────────┘
```

> ⚠️ 先提醒：**`.vercel.app` 免费域名在国内经常被墙/超时**（实测：部署成功、海外或代理能访问，国内直连打不开/一直转圈）。正式面向国内用户**必须绑自定义域名**。

### 阿里云（云解析 DNS）加记录示例（以绑定 `blog.puxiaoshuai.top` 为例）

1. 阿里云控制台 → **云解析 DNS** → 点 `puxiaoshuai.top` → **解析设置** → **添加记录**
2. 填写：

| 字段 | 值 |
|---|---|
| 记录类型 | **CNAME**（不要用 A） |
| 主机记录 | `blog` |
| 记录值 | **`cname.vercel-dns.com`** |
| TTL | 默认 |

> ⚠️ 实测踩坑：**子域名必须用 CNAME 指向 `cname.vercel-dns.com`**。如果错用 A 记录指向旧服务器 IP（例如 `111.229.99.183`），`blog.xxx.top` 会打开旧站，永远到不了 Vercel。
> 保存后可用 `nslookup blog.puxiaoshuai.top 223.5.5.5`（阿里云公共 DNS）验证，应看到 `Aliases: blog.puxiaoshuai.top → cname.vercel-dns.com`。

### 生效后

- **Vercel → Settings → Domains** 添加你的域名，等状态变绿 **Valid Configuration**。
- 改环境变量 `NEXTAUTH_URL` 和 `NEXT_PUBLIC_SITE_URL` 为正式域名并 **Redeploy**（build-time 注入，必须重新部署才生效）。
- 不想买域名？`xxx.vercel.app` 可先验证功能，`NEXTAUTH_URL` 不填预览也能登录（next-auth 自动从 `VERCEL_URL` 推断），但**国内访问不稳定**。

---

## 八、第七步：验证上线

1. 打开 `https://你的域名/zh` 和 `/en` → 文章、拾语、标签正常显示 → **数据库读取 OK**
2. 打开 `/login`，用 **`admin` / `admin123`** 登录 → 进入 `/dashboard`
3. **立刻在后台改掉初始密码**（个人资料页）
4. 顺手验证：`/sitemap.xml`、`/robots.txt` 里的域名是**你自己的**，不是 `www.puxiaoshuai.top`

---

## 九、日常更新发布

| 场景 | 操作 |
|---|---|
| 改代码/文章静态内容 | `git push` → Vercel 自动重新构建部署 |
| 后台写文章 | 写库 + `revalidatePath`，前台自动刷新（无需重新部署） |
| 改数据库结构 | 改 `prisma/schema.prisma` → `prisma migrate dev` 生成迁移 → push → GitHub Actions 自动 `migrate deploy` |
| 换域名 | 改 `NEXT_PUBLIC_SITE_URL` + `NEXTAUTH_URL` → Redeploy |

---

## 十、常见问题对照表

| 症状 | 原因 | 处理 |
|---|---|---|
| 构建失败 `module-not-found ... lib/generated/prisma/client` | 构建环境没跑 generate（Vercel 自动检测不可靠） | 确认 `package.json` 有 `postinstall: prisma generate`，`npm ci` 会自动生成；仍失败可在 Vercel Build Command 手动写 `prisma generate && next build` |
| 构建失败 `connect ECONNREFUSED` | `DATABASE_URL` 没配 / 配错 | 检查环境变量，确认用 pooled 地址 |
| 构建失败「表不存在」 | 迁移还没跑 | 先执行第五步 migrate deploy，再 Redeploy |
| 登录后跳转异常 / 回调错误 | `NEXTAUTH_URL` 不对 | 改成完整 https 域名 |
| 首页/文章打不开但能 build | 构建时数据库不可达 | SSG 在构建期查库，确保构建环境有 `DATABASE_URL` |
| 访问返回 `404: NOT_FOUND`（平台级，带请求 ID） | 请求没匹配到部署路由 | 依次确认：生产部署是否构建成功、Root Directory 是否正确、访问的是生产域名还是 Preview、Domains 是否 Valid |
| 所有页面打不开 / 500 | `NEXTAUTH_SECRET` 未配置，next-auth 中间件（`proxy.ts`）崩溃 | Vercel 配置 `NEXTAUTH_SECRET`（`openssl rand -base64 32`）后 Redeploy |
| 构建失败 `Could not find package.json` | Root Directory 设错 | GitHub 仓库根只有 `blog-project/`，Root Directory 必须填 `blog-project`（不是 `.`） |
| `.vercel.app` 国内打不开 / 超时 | 免费域名在国内被墙 | 绑定自定义域名，或临时用代理访问 |
| 限流不生效（所有人同一个 IP） | serverless 多实例 + 内存限流 | 代码注释已说明是"尽力而为"，博客量级够用 |
| `sitemap.xml` 指向旧域名 | 没配 `NEXT_PUBLIC_SITE_URL` | 配置后 Redeploy |

---

## 十一、官方参考

- [Vercel KB: Build a fullstack app with Next.js 16 and Prisma Postgres](https://vercel.com/kb/guide/nextjs-prisma-postgres)
- [Neon Docs: Connect from Prisma to Neon](https://neon.com/docs/guides/prisma)
- [Neon FAQ: pooled connection string 在哪找](https://neon.com/faqs/find-pooled-connection-string-dashboard)
- [Neon FAQ: DATABASE_URL 在哪找](https://neon.com/faqs/find-database-url-neon)
- [Prisma: Vercel 部署指南](https://www.prisma.io/docs/guides/postgres/vercel.md)
