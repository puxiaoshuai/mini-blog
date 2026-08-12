-- AlterTable
ALTER TABLE "Comment" ADD COLUMN "ip" TEXT;

-- CreateIndex
CREATE INDEX "Comment_ip_createdAt_idx" ON "Comment"("ip", "createdAt");
