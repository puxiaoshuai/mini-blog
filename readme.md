项目目录
blog-project/
├── app/
│   ├── (blog)/
│   │   ├── posts/
│   │   │   ├── [slug]/
│   │   │   │   └── page.tsx          # 文章详情页 (SSG)
│   │   │   └── page.tsx              # 文章列表页
│   │   ├── tags/
│   │   │   └── [tag]/
│   │   │       └── page.tsx          # 标签筛选页
│   │   ├── shiyu/
│   │   │   └── page.tsx              # 拾语页（动态流：一句话 / 一句话+配图）
│   │   └── layout.tsx
│   ├── (admin)/
│   │   ├── dashboard/
│   │   │   └── page.tsx              # 后台管理（权限保护）
│   │   └── layout.tsx
│   ├── api/
│   │   ├── posts/
│   │   │   ├── route.ts              # GET/POST 文章
│   │   │   └── [id]/
│   │   │       └── route.ts          # PUT/DELETE 文章
│   │   ├── shiyu/
│   │   │   ├── route.ts              # GET/POST 拾语
│   │   │   └── [id]/
│   │   │       └── route.ts          # PUT/DELETE 拾语
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts
│   └── layout.tsx
├── components/
│   ├── ui/                           # shadcn/ui 组件
│   ├── posts/
│   │   ├── PostCard.tsx
│   │   ├── PostList.tsx
│   │   └── MDXComponents.tsx         # 自定义MDX组件
│   └── common/
│       ├── Header.tsx
│       └── Footer.tsx
├── content/
│   ├── posts/                        # 所有MDX文章
│   │   ├── hello-world.mdx
│   │   └── typescript-tips.mdx
│   └── authors/                      # 作者信息
├── lib/
│   ├── db.ts                         # Prisma客户端
│   ├── contentlayer.ts               # Contentlayer配置
│   └── utils.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                       # 种子数据（含 10 条拾语）
├── types/
│   └── index.ts
└── next.config.js

数据表

generator client {
  provider = "prisma-client-js"
  previewFeatures = ["fullTextSearch"]
}

datasource db {
  provider = "sqlite"  // 开发用，生产可切换postgresql
  url      = env("DATABASE_URL")
}

model Post {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  excerpt     String?
  content     String   @db.Text
  coverImage  String?
  published   Boolean  @default(false)
  views       Int      @default(0)
  likes       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])
  tags        Tag[]    @relation()
  comments    Comment[]
  
  @@index([slug])
  @@index([published, createdAt])
  @@fulltext([title, excerpt, content])
}

model Tag {
  id        String   @id @default(cuid())
  name      String   @unique
  slug      String   @unique
  posts     Post[]
  createdAt DateTime @default(now())
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String?  // 仅在凭证登录时使用
  name      String?
  image     String?
  role      Role     @default(USER)
  posts     Post[]
  comments  Comment[]
  shiyus    Shiyu[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Comment {
  id        String   @id @default(cuid())
  content   String   @db.Text
  published Boolean  @default(true)
  postId    String
  post      Post     @relation(fields: [postId], references: [id])
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
}

model Shiyu {
  id        String   @id @default(cuid())
  content   String   @db.Text          // 一句话正文
  images    String?  @db.Text          // 配图（JSON 数组，可为空）
  pinned    Boolean  @default(false)   // 置顶
  published Boolean  @default(true)    // 发布状态
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([published, createdAt])
}

enum Role {
  USER
  ADMIN
}

---

## 拾语（Shiyu · 动态流）

「拾语」展示作者的动态：每条可以是一句话，也可以是一句话 + 一张配图（`images` 存 JSON 数组，纯文字可为空）。页面路径 `/shiyu`，管理端在后台「拾语」分栏维护，前台只读展示。

初始种子数据 10 条（`prisma/seed.ts`，编号 N°027–N°036，与 `design/shiyu.html` 一致）：

| N° | 日期 | 配图 | 内容（节选） |
|---|---|---|---|
| 036 | 2026.08.09 | — | 「好的工具，是让时间变多，而不是变少。」（置顶） |
| 035 | 2026.08.07 | 1 图 | 窗外成都下了一整天的雨，树影把屏幕染成墨绿…… |
| 034 | 2026.07.29 | — | claude.md 不是越长越好：200 行以内，每一条都得是「精准的约定」。 |
| 033 | 2026.07.20 | 1 图 | 把 Elasticsearch 跑起来的第一晚：1.2 万条记录，全文检索 8ms。 |
| 032 | 2026.07.13 | — | 「interface 定义是什么，type 描述什么关系。」一行话写进团队规范。 |
| 031 | 2026.07.02 | 1 图 | 纸感编辑风的灵感，来自一本 1984 年的旧杂志。 |
| 030 | 2026.06.18 | — | 制心一处，无事不办。今天只改一个 bug：三个文件，删掉四十行。 |
| 029 | 2026.05.30 | 1 图 | 成都的雨说来就来，茶馆的盖碗茶却一直冒着热气。 |
| 028 | 2026.04.12 | — | 攒了三年拾语，发现值得记录的生活，大多是「一句话 + 一点光」。 |
| 027 | 2026.03.08 | 1 图 | 深夜写完最后一个 commit，回头看了看写了十年的博客…… |