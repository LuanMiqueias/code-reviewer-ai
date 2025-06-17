/*
  Warnings:

  - You are about to drop the column `projectFileId` on the `CodeChunkEmbed` table. All the data in the column will be lost.
  - Added the required column `filePath` to the `CodeChunkEmbed` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CodeChunkEmbed" DROP COLUMN "projectFileId",
ADD COLUMN     "filePath" TEXT NOT NULL;
