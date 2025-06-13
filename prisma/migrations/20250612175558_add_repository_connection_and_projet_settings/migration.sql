-- CreateEnum
CREATE TYPE "ProviderType" AS ENUM ('GITHUB', 'BITBUCKET');

-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('FRONTEND', 'BACKEND', 'FULLSTACK');

-- CreateEnum
CREATE TYPE "ArchitectureType" AS ENUM ('DDD');

-- CreateTable
CREATE TABLE "RepoConnection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "provider" "ProviderType" NOT NULL,
    "tokenHash" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepoConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectSettings" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "projectType" "ProjectType" NOT NULL,
    "architecture" "ArchitectureType" NOT NULL,
    "codingStyle" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectSettings_repositoryId_key" ON "ProjectSettings"("repositoryId");

-- AddForeignKey
ALTER TABLE "RepoConnection" ADD CONSTRAINT "RepoConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectSettings" ADD CONSTRAINT "ProjectSettings_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "RepoConnection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
