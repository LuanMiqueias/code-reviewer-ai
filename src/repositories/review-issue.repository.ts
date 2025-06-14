import { Prisma, ReviewIssue } from "@prisma/client";

export interface ReviewIssueRepository {
	create(data: Prisma.ReviewIssueCreateInput): Promise<ReviewIssue>;
	findById(id: string): Promise<ReviewIssue | null>;
	getAllByReviewSessionId(repoConnectionId: string): Promise<ReviewIssue[]>;
}
