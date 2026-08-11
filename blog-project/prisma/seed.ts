import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

/** 拾语种子：N°027–036，与 design/shiyu.html 一致（5 条配图 + 5 条纯文字） */
const SHIYUS = [
  {
    no: "036",
    date: "2026-08-09",
    pinned: true,
    content: "「好的工具，是让时间变多，而不是变少。」",
  },
  {
    no: "035",
    date: "2026-08-07",
    images: [
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1200&auto=format&fit=crop",
    ],
    content:
      "窗外成都下了一整天的雨，树影把屏幕染成墨绿。雨天适合读库，也适合发呆。",
  },
  {
    no: "034",
    date: "2026-07-29",
    content:
      "claude.md 不是越长越好：200 行以内，每一条都得是「精准的约定」。",
  },
  {
    no: "033",
    date: "2026-07-20",
    images: [
      "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=1200&auto=format&fit=crop",
    ],
    content: "把 Elasticsearch 跑起来的第一晚：1.2 万条记录，全文检索 8ms。",
  },
  {
    no: "032",
    date: "2026-07-13",
    content:
      "「interface 定义是什么，type 描述什么关系。」一行话写进团队规范。",
  },
  {
    no: "031",
    date: "2026-07-02",
    images: [
      "https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=1200&auto=format&fit=crop",
    ],
    content: "纸感编辑风的灵感，来自一本 1984 年的旧杂志。",
  },
  {
    no: "030",
    date: "2026-06-18",
    content:
      "制心一处，无事不办。今天只改一个 bug：三个文件，删掉四十行。",
  },
  {
    no: "029",
    date: "2026-05-30",
    images: [
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=1200&auto=format&fit=crop",
    ],
    content: "成都的雨说来就来，茶馆的盖碗茶却一直冒着热气。",
  },
  {
    no: "028",
    date: "2026-04-12",
    content: "攒了三年拾语，发现值得记录的生活，大多是「一句话 + 一点光」。",
  },
  {
    no: "027",
    date: "2026-03-08",
    images: [
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop",
    ],
    content: "深夜写完最后一个 commit，回头看了看写了十年的博客……",
  },
];

async function main() {
  console.log("🌱 开始播种 …");

  // 管理员（默认密码 admin123，登录功能 M4 接入）
  const passwordHash = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "1372553910@qq.com" },
    update: {},
    create: {
      email: "1372553910@qq.com",
      name: "蒲小帅",
      password: passwordHash,
      role: "ADMIN",
    },
  });

  // 标签
  const tags = {
    typescript: await prisma.tag.upsert({
      where: { slug: "typescript" },
      update: {},
      create: { name: "TypeScript", slug: "typescript" },
    }),
    claude: await prisma.tag.upsert({
      where: { slug: "claude" },
      update: {},
      create: { name: "Claude", slug: "claude" },
    }),
  };

  // 示例文章（MDX 内容，M2 渲染）：先清空再重建，保证每次 seed 内容最新
  await prisma.post.deleteMany();
  await prisma.post.create({
    data: {
      title: "你好，大道至简",
      slug: "hello-world",
      excerpt: "从 WordPress 迁移到 Next.js 的第一篇。",
      content: [
        "## 为什么换到 Next.js",
        "",
        "从 WordPress（Qzdy 主题）迁移而来，想要更快的首屏、更自由的排版，以及 MDX 带来的写作体验。",
        "",
        "- 静态生成 + 按需刷新（SSG / ISR）",
        "- 纸感编辑风：暖纸、墨黑、朱红",
        "- 正文即 Markdown，代码高亮开箱即用",
        "",
        "> 时光是画在卷上的河流。—— 站名副题",
        "",
        "## 迁移计划",
        "",
        "后续把真实文章逐步搬进来，见仓库根目录的《任务清单》。",
      ].join("\n"),
      published: true,
      authorId: admin.id,
      tags: { connect: [{ id: tags.claude.id }] },
    },
  });
  await prisma.post.create({
    data: {
      title: "TypeScript: interface vs type 终极指南",
      slug: "typescript-tips",
      excerpt: "interface 定义是什么，type 描述什么关系。",
      coverImage:
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=1400&auto=format&fit=crop",
      content: [
        "## interface 与 type 的分工",
        "",
        "`interface` 定义是什么（对象契约），`type` 描述什么关系（任意类型组合）。",
        "",
        "| | interface | type |",
        "|---|---|---|",
        "| 对象形状 | ✅ 推荐 | ✅ |",
        "| 联合 / 交叉 | ❌ | ✅ |",
        "| 合并声明 | ✅ | ❌ |",
        "",
        "## 示例",
        "",
        "```ts",
        "type ID = string | number;",
        "interface User {",
        "  id: ID;",
        "  name: string;",
        "}",
        "function greet(u: User) {",
        "  return `你好，${u.name}`;",
        "}",
        "```",
        "",
        "> 「interface 定义是什么，type 描述什么关系。」一行话写进团队规范。",
        "",
        "## 何时用谁",
        "",
        "- 库的公开 API / 可扩展对象 → `interface`",
        "- 联合、元组、工具类型组合 → `type`",
      ].join("\n"),
      published: true,
      authorId: admin.id,
      tags: { connect: [{ id: tags.typescript.id }] },
    },
  });

  // 拾语：先清空再重建，保证可重复执行
  await prisma.shiyu.deleteMany();
  for (const s of SHIYUS) {
    await prisma.shiyu.create({
      data: {
        no: parseInt(s.no, 10), // N°036 → 36
        content: s.content,
        images: s.images ? JSON.stringify(s.images) : null,
        pinned: s.pinned ?? false,
        published: true,
        createdAt: new Date(s.date),
        authorId: admin.id,
      },
    });
  }

  console.log(`✅ 播种完成：管理员 ×1、标签 ×2、文章 ×2、拾语 ×${SHIYUS.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
