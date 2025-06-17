/*
  Warnings:

  - The `architecture` column on the `ProjectSettings` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ProjectSettings" ADD COLUMN     "entriesFilesToAnalyze" TEXT[] DEFAULT ARRAY['**/*.{ts,js,tsx,jsx}']::TEXT[],
ADD COLUMN     "entriesFoldersToIgnore" TEXT[] DEFAULT ARRAY['node_modules', 'dist', 'build', 'public']::TEXT[],
DROP COLUMN "architecture",
ADD COLUMN     "architecture" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "ReviewIssue" ADD COLUMN     "filePath" TEXT NOT NULL DEFAULT '';

-- DropEnum
DROP TYPE "ArchitectureType";

-- CreateTable
CREATE TABLE "ProjectFile" (
    "id" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectSettingsId" TEXT,

    CONSTRAINT "ProjectFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodeChunkEmbed" (
    "id" TEXT NOT NULL,
    "embedding" DOUBLE PRECISION[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectFileId" TEXT NOT NULL,

    CONSTRAINT "CodeChunkEmbed_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProjectFile" ADD CONSTRAINT "ProjectFile_projectSettingsId_fkey" FOREIGN KEY ("projectSettingsId") REFERENCES "ProjectSettings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeChunkEmbed" ADD CONSTRAINT "CodeChunkEmbed_projectFileId_fkey" FOREIGN KEY ("projectFileId") REFERENCES "ProjectFile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
