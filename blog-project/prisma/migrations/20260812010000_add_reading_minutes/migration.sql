-- 阅读时长入库：列表查询不再需要拉正文来计算
ALTER TABLE "Post" ADD COLUMN "readingMinutes" INTEGER NOT NULL DEFAULT 0;

-- 回填存量文章（与旧前端算法一致：Math.max(1, round(content.length / 400))）
UPDATE "Post"
SET "readingMinutes" = GREATEST(1, ROUND(CHAR_LENGTH("content")::numeric / 400))::integer;
