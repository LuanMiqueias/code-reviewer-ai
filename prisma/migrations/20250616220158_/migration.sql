/*
  Warnings:

  - You are about to drop the `ProjectFile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CodeChunkEmbed" DROP CONSTRAINT "CodeChunkEmbed_projectFileId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectFile" DROP CONSTRAINT "ProjectFile_projectSettingsId_fkey";

-- AlterTable
ALTER TABLE "CodeChunkEmbed" ADD COLUMN     "projectSettingsId" TEXT;

-- DropTable
DROP TABLE "ProjectFile";

-- AddForeignKey
ALTER TABLE "CodeChunkEmbed" ADD CONSTRAINT "CodeChunkEmbed_projectSettingsId_fkey" FOREIGN KEY ("projectSettingsId") REFERENCES "ProjectSettings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
