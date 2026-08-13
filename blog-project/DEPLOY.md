# 部署指南（宝塔面板 · Nginx + PM2）

本项目为 **Next.js 16 + Prisma 7（PostgreSQL）+ next-auth + Hono API**。本文档以宝塔面板
的 **Nginx + PM2（Node 项目）** 方式部署——这是宝塔环境下最标准、最好维护的方案。

> 备选：仓库里另有 `docker-compose.yml`，但它目前**只包含数据库**（本地开发用），不含应用，
> 如需 Docker 部署需自行补充 app 服务，见文末「备选」。

---

## 0. 部署前提（三个坑先记住）

1. **Node 必须 ≥ 20.9**（Next.js 16 要求），宝塔安装 Node 22 LTS。
2. **`prisma generate` 必须在服务器上跑** —— Prisma client 生成在
   `lib/generated/prisma`，已被 `.gitignore` 排除，上传代码后不会带过来。
3. **build 阶段就要连数据库**（博客页是 SSG，构建时查库），所以顺序严格为：
   先建库 → 配 `.env` → `generate` → `migrate` → `seed` → `build`。

---

## 1. 宝塔面板装软件

软件商店安装：

- **Nginx**
- **Node.js 版本管理器**（安装 v22 LTS；或直接装 **PM2 管理器**）
- **PostgreSQL**（本项目用 PG，不是 MySQL）

## 2. 创建数据库

宝塔「数据库」→ 添加 PostgreSQL 数据库：

- 数据库名：`mini_blog`
- 用户名 / 密码：单独新建一个（不要用 `postgres` 超级用户）

记下用户名、密码，下一步填进 `.env`。

## 3. 上传代码

把 `blog-project` 目录上传到服务器，如 `/www/wwwroot/blog-project`：

- 有 git 仓库：宝塔「终端」里 `git clone` 后拉最新；
- 无仓库：本地压缩上传，宝塔解压。

进入项目目录并安装依赖（**全量安装**，`build` 需要 devDependencies）：

```bash
cd /www/wwwroot/blog-project
npm install
```

## 4. 配置生产环境变量 `.env`

在项目根目录新建 `.env`（被 `.gitignore` 排除，服务器上需手动创建）：

```env
# PostgreSQL：换成第 2 步宝塔里建好的 库名/用户名/密码
DATABASE_URL="postgresql://博客用户名:博客密码@127.0.0.1:5432/mini_blog?schema=public"

# 强随机密钥，本地生成：openssl rand -base64 32
NEXTAUTH_SECRET="换成你的强密钥"

# 改成你的真实域名（https）
NEXTAUTH_URL="https://你的域名.com"
```

> ⚠️ 本地 `.env` 是开发配置（`localhost` + `dev-only-secret`），**不能直接用于生产**。
> 数据库连接建议写 `127.0.0.1` 而非 `localhost`，避免解析到 `::1` 连不上。

## 5. 初始化数据库 + 构建（顺序不能乱）

```bash
# ① 生成 Prisma client（被 gitignore，必须在服务器做）
npx prisma generate

# ② 把迁移应用到生产库（不丢数据）
npx prisma migrate deploy

# ③ 写入种子数据（管理员账号见下方说明）
npx prisma db seed

# ④ 构建
npm run build
```

**seed 创建的管理员**（来自 `prisma/seed.ts`）：

| 项 | 值 |
|---|---|
| 登录账号 | `admin` |
| 密码 | `admin123` |
| 邮箱 | `1372553910@qq.com` |

> 上线后请务必到 `/dashboard` 后台改掉初始密码，并更换 `NEXTAUTH_SECRET`。
> 若 build 报数据库连接错误：检查 `.env` 是否已就位、库是否已建、顺序是否颠倒。

## 6. PM2 启动

**方式 A · 宝塔 Node 项目**（推荐）：宝塔「Node 项目管理器」添加项目：

- 项目目录：`/www/wwwroot/blog-project`
- 启动命令：`npm start -- -p 8112`（即 `next start -p 8112`，监听 `8112` 端口）

**方式 B · 终端 PM2**：

```bash
cd /www/wwwroot/blog-project
pm2 start npm --name blog -- run start -- -p 8112
pm2 save
pm2 startup   # 设置开机自启
```

> 端口统一用 `8112`（与下方 Nginx 反代一致）。也可改用环境变量 `PORT=8112`（`next start` 会读取）。

## 7. Nginx 反向代理

宝塔「网站」→ 添加站点（绑定你的域名）→ 站点设置 → **反向代理**：

- 目标 URL：`http://127.0.0.1:8112`
- 发送域名：`$host`（宝塔默认会带上 Host，next-auth 登录跳转依赖 Host 透传）

再为站点配置 SSL（宝塔 Let's Encrypt 一键申请），即可通过 `https://你的域名` 访问。

## 8. 验证

- 前台 `/`、`/posts`、`/shiyu` 可正常打开 → 数据读取正常
- `/login` 用 `admin / admin123` 登录 → 进入 `/dashboard` 管理后台

---

## 运维备忘

- **重启应用**：`pm2 restart blog`
- **查看日志**：宝塔 Node 项目页，或 `pm2 logs blog`
- **更新发布**（拉代码后）：
  ```bash
  cd /www/wwwroot/blog-project
  git pull
  npm install
  npx prisma generate
  npx prisma migrate deploy   # 仅当迁移文件有新增时
  npm run build
  pm2 restart blog
  ```
- **数据库备份**：宝塔数据库页支持定时备份到本地/OSS，建议配置每日备份。

---

## 备选：Docker 部署

现有 `docker-compose.yml` 只包含 PostgreSQL 服务。若要在宝塔用 Docker 部署整个应用，
需要自行补充：

1. 项目根目录新增 `Dockerfile`（多阶段：`node:22-alpine` 构建 → 产物镜像，跑 `next start`）；
2. `docker-compose.yml` 增加 `app` 服务并挂载 `.env`、暴露端口；
3. 用宝塔「Docker 管理器」编排。

对宝塔环境而言，Nginx + PM2 方案改动更小、更易排查，**优先推荐前者**。
