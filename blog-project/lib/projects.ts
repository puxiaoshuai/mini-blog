/**
 * 首页「我的项目」静态数据 · 在此维护你的真实项目
 *
 * 项目属于静态内容（数量少、基本不变），无需进数据库，
 * 直接编辑下方数组即可增删改。
 *
 * ⚠️ 上线后的新增流程：改本文件 → git commit + push → Vercel
 *    自动重新部署（约 1 分钟）即生效。无需（也不能）在线改。
 *    字段说明：
 *
 *   no        mono 编号（仅展示，可写 "PROJECT N°01"）
 *   name      项目名
 *   desc      一句话简介（在卡片里展示）
 *   period    时间区间（展示用，如 "2024 — 至今"）
 *   tags      技术栈标签（数组）
 *   image     封面图 URL（建议宽度 ≥900 的横图）
 *   demoUrl   在线演示地址（没有就留 ""，卡片会隐藏该按钮）
 *   githubUrl 源码地址（没有就留 ""，卡片会隐藏该按钮）
 */
export type Project = {
  no: string;
  name: string;
  desc: string;
  period: string;
  tags: string[];
  image: string;
  demoUrl: string;
  githubUrl: string;
};

export const PROJECTS: Project[] = [
  {
    no: "PROJECT N°01",
    period: "2024 — 至今",
    name: "墨笺 · InkNote",
    desc: "一款极简的 Markdown 笔记应用。离线优先，毫秒级全文搜索，支持双向链接与思维导图预览，数据以 SQLite 本地存储。",
    tags: ["Next.js", "Tailwind", "Prisma"],
    image:
      "https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=900&auto=format&fit=crop",
    demoUrl: "",
    githubUrl: "",
  },
  {
    no: "PROJECT N°02",
    period: "2023 — 2025",
    name: "诗笺 · Shijian CLI",
    desc: "在终端里为代码与文字排版的命令行工具。支持中英混排、语法高亮与「纸感」主题输出，让 CLI 也读起来像一首诗。",
    tags: ["Rust", "CLI", "Nushell"],
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=900&auto=format&fit=crop",
    demoUrl: "",
    githubUrl: "",
  },
  {
    no: "PROJECT N°03",
    period: "迁移中",
    name: "大道至简 · 本站",
    desc: "你正在看的这个博客。原 WordPress（Qzdy 主题）迁移至 Next.js + MDX + Prisma，纸感编辑风格，代码开源。",
    tags: ["Next.js", "MDX", "Prisma", "Tailwind"],
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=900&auto=format&fit=crop",
    demoUrl: "",
    githubUrl: "",
  },
];
