/**
 * 临时测试数据脚本（用后即删）：
 *   - 20 个标签
 *   - 100 篇文章（含封面/阅数/赞/草稿，约 1/3 有封面）
 *   - 100 条拾语（序号接在现有 max(no) 之后，少量置顶/带图）
 *
 * 幂等：重复运行会先清掉上次的测试数据（slug / content 前缀标记）。
 * 注意：再跑 `npx prisma db seed` 会重建种子数据，测试数据会被清掉。
 * 运行：npx tsx scripts/insert-test-data.ts
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const TAG_NAMES = [
  "前端", "后端", "数据库", "AI", "工具", "效率", "设计", "随笔", "生活", "阅读",
  "工程", "DevOps", "Rust", "Go", "Python", "架构", "测试", "性能", "开源", "思考",
];

const COVERS = [
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=900&auto=format&fit=crop",
];

function randomDate(from: Date, to: Date) {
  return new Date(from.getTime() + Math.random() * (to.getTime() - from.getTime()));
}

function postContent(i: number) {
  return [
    `## 第 ${i} 章 · 测试内容`,
    "",
    `这是第 ${i} 篇测试文章，用于验证首页卡片网格、分页、搜索与管理列表的展示。`,
    "",
    "- 要点一：纸感编辑风排版",
    "- 要点二：Next.js 16 + MDX",
    "",
    "> 时光是画在卷上的河流。—— 站名副题",
    "",
    "```ts",
    `const postNo = ${i};`,
    "export default function Page() { return <div>{postNo}</div>; }",
    "```",
  ].join("\n");
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) throw new Error("数据库没有管理员用户，先跑 seed");

  // 幂等清理：清掉上次的测试数据
  const [delPosts, delTags, delShiyus] = await Promise.all([
    prisma.post.deleteMany({ where: { slug: { startsWith: "test-post-" } } }),
    prisma.tag.deleteMany({ where: { slug: { startsWith: "test-tag-" } } }),
    prisma.shiyu.deleteMany({ where: { content: { startsWith: "【测试拾语" } } }),
  ]);
  console.log(`清理上次测试数据：文章 ${delPosts.count}、标签 ${delTags.count}、拾语 ${delShiyus.count}`);

  // 1️⃣ 20 个标签
  const tags = [];
  for (let i = 0; i < TAG_NAMES.length; i++) {
    const t = await prisma.tag.create({
      data: { name: `测试·${TAG_NAMES[i]}`, slug: `test-tag-${String(i).padStart(2, "0")}` },
    });
    tags.push(t);
  }
  console.log(`✅ 标签 ×${tags.length}`);

  // 2️⃣ 100 篇文章
  for (let i = 1; i <= 100; i++) {
    const num = String(i).padStart(3, "0");
    const postTags = shuffle(tags).slice(0, 1 + (i % 3)); // 每篇 1~3 个标签
    await prisma.post.create({
      data: {
        title: `测试文章 ${num}`,
        slug: `test-post-${num}`,
        excerpt: `第 ${i} 篇测试文章的摘要，填充首页文章网格与搜索命中。`,
        content: postContent(i),
        coverImage: i % 3 === 0 ? COVERS[i % COVERS.length] : null,
        published: i % 10 !== 0, // 每第 10 篇为草稿
        views: Math.floor(Math.random() * 500),
        likes: Math.floor(Math.random() * 50),
        createdAt: randomDate(new Date("2025-08-01"), new Date("2026-08-11")),
        authorId: admin.id,
        tags: { connect: postTags.map((t) => ({ id: t.id })) },
      },
    });
    if (i % 20 === 0) console.log(`文章 ${i}/100`);
  }
  console.log("✅ 文章 ×100");

  // 3️⃣ 100 条拾语（序号接 max(no)）
  const maxNo = (await prisma.shiyu.aggregate({ _max: { no: true } }))._max.no ?? 0;
  const shiyuRows = [];
  for (let i = 1; i <= 100; i++) {
    const no = maxNo + i;
    shiyuRows.push({
      no,
      content: `【测试拾语 ${no}】第 ${i} 条测试拾语：一句话，或一句话加一张图，用来验证时间线与加载更多。`,
      images: i % 5 === 0 ? JSON.stringify([COVERS[i % COVERS.length]]) : null,
      pinned: i === 1 || i === 2, // 前两条置顶
      published: i % 12 !== 0, // 每第 12 条为草稿
      createdAt: randomDate(new Date("2025-08-01"), new Date("2026-08-11")),
      authorId: admin.id,
    });
  }
  await prisma.shiyu.createMany({ data: shiyuRows });
  console.log(`✅ 拾语 ×100（序号 ${maxNo + 1} ~ ${maxNo + 100}）`);

  const [pc, tc, sc] = await Promise.all([
    prisma.post.count(),
    prisma.tag.count(),
    prisma.shiyu.count(),
  ]);
  console.log(`📊 现库总量：文章 ${pc}、标签 ${tc}、拾语 ${sc}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
