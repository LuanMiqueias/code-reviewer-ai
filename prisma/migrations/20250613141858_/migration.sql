/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `RepoConnection` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "ProjectSettings" DROP CONSTRAINT "ProjectSettings_repositoryId_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "RepoConnection_name_key" ON "RepoConnection"("name");

-- AddForeignKey
ALTER TABLE "ProjectSettings" ADD CONSTRAINT "ProjectSettings_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "RepoConnection"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
