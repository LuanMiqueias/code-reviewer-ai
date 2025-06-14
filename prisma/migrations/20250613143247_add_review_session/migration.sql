-- CreateTable
CREATE TABLE "ReviewSession" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewIssue" (
    "id" TEXT NOT NULL,
    "reviewSessionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,

    CONSTRAINT "ReviewIssue_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ReviewSession" ADD CONSTRAINT "ReviewSession_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "RepoConnection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewIssue" ADD CONSTRAINT "ReviewIssue_reviewSessionId_fkey" FOREIGN KEY ("reviewSessionId") REFERENCES "ReviewSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
