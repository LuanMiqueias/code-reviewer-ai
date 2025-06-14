/*
  Warnings:

  - You are about to drop the column `chunkId` on the `ReviewIssue` table. All the data in the column will be lost.
  - You are about to drop the `ReviewedCodeChunk` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ReviewIssue" DROP CONSTRAINT "ReviewIssue_chunkId_fkey";

-- AlterTable
ALTER TABLE "ReviewIssue" DROP COLUMN "chunkId",
ADD COLUMN     "embedding" DOUBLE PRECISION[];

-- DropTable
DROP TABLE "ReviewedCodeChunk";
