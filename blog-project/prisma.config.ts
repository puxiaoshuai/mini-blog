import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/** Prisma 7 配置：连接串移出 schema，统一在此配置（含 migrate / seed 使用） */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
