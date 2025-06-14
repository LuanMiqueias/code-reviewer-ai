/*
  Warnings:

  - You are about to drop the column `embedding` on the `ReviewIssue` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ReviewIssue" DROP COLUMN "embedding",
ADD COLUMN     "chunkId" TEXT;

-- CreateTable
CREATE TABLE "ReviewedCodeChunk" (
    "id" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" DOUBLE PRECISION[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewedCodeChunk_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ReviewIssue" ADD CONSTRAINT "ReviewIssue_chunkId_fkey" FOREIGN KEY ("chunkId") REFERENCES "ReviewedCodeChunk"("id") ON DELETE SET NULL ON UPDATE CASCADE;
