# 第 2 节 · 数据层：Prisma 7

> 博客的一切围绕数据。这一节讲 Prisma 7 的新架构、数据模型设计、以及项目里的实战查询模式。

---

## 一、Prisma 7 与旧版的关键区别

Prisma 7 是个大版本，项目里的两处写法能看出变化：

**1. 新的 client 生成方式（`prisma-client` provider）**

```prisma
generator client {
  provider = "prisma-client"        // ← 旧版是 "prisma-client-js"
  output   = "../lib/generated/prisma"   // ← 显式输出目录（旧版默认 node_modules）
}
```

生成产物直接落到 `lib/generated/prisma/`，类型是**项目内代码**而非 node_modules 里一团乱，IDE 跳转更友好。但这个目录被 `.gitignore` 排除了，**部署时必须在服务器上重新 `prisma generate`**（第 10 节踩坑点）。

**2. Driver Adapter 直连数据库（无 rust engine）**

```ts
// lib/db.ts
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });
```

旧版 Prisma 内置一套 rust 二进制 engine；7.x 通过 `@prisma/adapter-pg` 直接复用 Node 生态的 `pg` 驱动，**体积小、启动快、部署省心**（不再有 engine 下载失败问题）。

## 二、单例模式：防热重载重复实例

Next dev 模式下，模块会被反复加载。若每次 import 都 `new PrismaClient()`，会开一堆连接，报「Too many clients」。

```ts
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

> `globalThis` 在 dev 热重载时不被重置，于是**开发环境复用同一个实例**；生产环境每次请求是独立进程，不需要缓存。

## 三、数据模型设计（逐表拆解）

### Post —— 文章（核心表）

```prisma
model Post {
  id             String   @id @default(cuid())
  title          String
  slug           String   @unique            // URL 用，必须唯一
  excerpt        String?                      // 摘要
  content        String                       // MDX 全文
  coverImage     String?
  published      Boolean  @default(false)    // 草稿 = false
  views          Int      @default(0)        // 浏览量
  likes          Int      @default(0)        // 点赞
  readingMinutes Int      @default(0)        // ★ 发布时算好入库
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  authorId       String
  author         User     @relation(fields: [authorId], references: [id])
  tags           Tag[]    @relation()
  comments       Comment[]

  @@index([published, createdAt])            // 列表查询复合索引
}
```

设计要点：
- **`slug @unique`** —— 唯一约束既是业务需要，也会被 Prisma 转成数据库唯一索引。重复时抛 `P2002`，项目里专门捕获转成 409（第 8 节）。
- **`readingMinutes` 预计算** —— 发布时按正文长度算好写入，列表页**只 select 这个数字，不拉几万字的 MDX 正文**。这是性能上的关键决策。
- **复合索引 `@@index([published, createdAt])`** —— 列表查询的 `where published=true orderBy createdAt desc` 正好命中。

### Tag / User / Comment / Shiyu

```prisma
model Tag {
  id   String @id @default(cuid())
  name String @unique
  slug String @unique
  posts Post[]
}

model User {
  id       String @id @default(cuid())
  email    String @unique
  username String? @unique    // 凭证登录用
  password String?            // bcrypt 哈希，不存在明文
  role     Role   @default(USER)   // ADMIN / USER
  posts    Post[]
  comments Comment[]
  shiyus   Shiyu[]
}

model Comment {
  id        String   @id @default(cuid())
  content   String
  published Boolean  @default(true)   // 审核位
  ip        String?                   // 限流 + 审核用
  postId    String
  authorId  String
  createdAt DateTime @default(now())
  @@index([ip, createdAt])            // 按 IP 限流查询
}

model Shiyu {
  no        Int     @default(0)      // 流水号 N°xxx
  content   String
  images    String?                  // JSON 数组字符串
  pinned    Boolean @default(false)  // 置顶
  published Boolean @default(true)
  @@index([published, createdAt])
}
```

几个值得记住的点：
- **`Tag.name` 和 `Tag.slug` 双唯一**：名字给人看，slug 给 URL 用；slug 由 github-slugger 从名字生成。
- **`Comment.published` 审核位**：访客评论默认 `false`，管理员后台通过后才展示——用「状态位」而非「删除」来做审核，简单又安全。
- **`Shiyu.images` 存 JSON 字符串**：字段本身是 `String?`，数组 `JSON.stringify` 后入库，读出时 `JSON.parse`（见 `toShiyuItem`）。量小，不值得为它再建一张关联表。

## 四、数据访问层（DAL）实战模式

项目把查询抽到 `lib/posts.ts` / `lib/shiyu.ts`，**页面（Server Component）和 Hono API 共用**。几个高频模式：

### 1. 分页：`count` 和 `findMany` 并行

```ts
const skip = (page - 1) * pageSize;
const [total, items] = await Promise.all([
  prisma.post.count({ where: { published: true } }),
  fetchPostCards(skip, pageSize),       // findMany with select
]);
return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
```

两个查询互不依赖 → `Promise.all` 并行，省一半时间。

### 2. 聚合统计：`_sum` / `_min` / `_max`

```ts
prisma.post.aggregate({ _sum: { views: true }, where: { published: true } });
// 首页四个统计并行
const [posts, views, tags, shiyus] = await Promise.all([
  prisma.post.count(...),
  prisma.post.aggregate({ _sum: { views: true }, ... }),
  prisma.tag.count(),
  prisma.shiyu.count(...),
]);
```

首页的「文章/浏览/标签/拾语」四格统计，一次并行全拿齐。

### 3. `upsert`：标签和访客用户

新建文章时标签可能已存在也可能没有，`upsert` 一步搞定：

```ts
const tag = await prisma.tag.upsert({
  where: { name },        // 按唯一键查
  update: {},             // 存在：不动
  create: { name, slug: slugger.slug(name) },  // 不存在：创建
});
```

评论模块也用同样手法对**访客邮箱** find-or-create 用户（只存显示名，无密码不可登录）。

### 4. 自增计数：`increment`

```ts
prisma.post.update({ where: { id }, data: { likes: { increment: 1 } } });
```

不用先读后写（有并发覆盖风险），数据库原子操作 `+1`。

### 5. 游标式相邻文章

上一篇 / 下一篇用 `createdAt` 做 `<` `>` 过滤：

```ts
prisma.post.findFirst({ where: { published: true, createdAt: { lt: post.createdAt } }, orderBy: { createdAt: "desc" } });
```

## 五、seed 数据脚本

`prisma/seed.ts` 用 `tsx` 执行，跑在 build 之前（部署第 10 节强调顺序）：

```ts
const prisma = new PrismaClient({ adapter });   // 同样走 driver adapter
// 批量插入拾语、文章、管理员账号（密码 bcrypt.hash 后再入库）
```

`package.json` 里配置 seed 入口：
```json
"prisma": { "seed": "tsx prisma/seed.ts" }
```

## 六、本节小结

- **Prisma 7** = `prisma-client` 生成器（代码落项目内）+ driver adapter 直连 PG，无 rust engine。
- **单例 + globalThis** 防 dev 热重载重复建连。
- **预计算 `readingMinutes`** + 复合索引，是列表页性能的根基。
- DAL 层页面与 API 共用，五种实战模式：并行分页 / 聚合 / upsert / increment / 游标相邻。

下一节：**API 层 —— 为什么用 Hono，怎么挂在 Route Handler 上**。
