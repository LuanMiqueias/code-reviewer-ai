/*
  Warnings:

  - You are about to drop the `Issue` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "ReviewIssue" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "embedding" DOUBLE PRECISION[];

-- DropTable
DROP TABLE "Issue";
