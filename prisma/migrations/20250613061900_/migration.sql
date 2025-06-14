/*
  Warnings:

  - You are about to drop the column `tokenHash` on the `RepoConnection` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `RepoConnection` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `RepoConnection` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[accountId,name]` on the table `RepoConnection` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cloneUrl` to the `RepoConnection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `defaultBranch` to the `RepoConnection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `language` to the `RepoConnection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerName` to the `RepoConnection` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RepoConnection" DROP CONSTRAINT "RepoConnection_userId_fkey";

-- AlterTable
ALTER TABLE "RepoConnection" DROP COLUMN "tokenHash",
DROP COLUMN "url",
DROP COLUMN "userId",
ADD COLUMN     "accountId" TEXT,
ADD COLUMN     "cloneUrl" TEXT NOT NULL,
ADD COLUMN     "defaultBranch" TEXT NOT NULL,
ADD COLUMN     "language" TEXT NOT NULL,
ADD COLUMN     "ownerName" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerUserName" TEXT NOT NULL,
    "provider" "ProviderType" NOT NULL,
    "providerUserId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerUserId_key" ON "Account"("provider", "providerUserId");

-- CreateIndex
CREATE UNIQUE INDEX "RepoConnection_accountId_name_key" ON "RepoConnection"("accountId", "name");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepoConnection" ADD CONSTRAINT "RepoConnection_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
