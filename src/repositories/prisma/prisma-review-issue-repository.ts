import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";
import { ReviewIssueRepository } from "../review-issue.repository";

export class PrismaReviewIssueRepository implements ReviewIssueRepository {
	async create(data: Prisma.ReviewIssueCreateInput) {
		const reviewIssue = await prisma.reviewIssue.create({
			data,
		});

		return reviewIssue;
	}

	async findById(id: string) {
		const reviewIssue = await prisma.reviewIssue.findUnique({
			where: {
				id,
			},
		});

		return reviewIssue;
	}

	async getAllByReviewSessionId(repoConnectionId: string) {
		const reviewIssues = await prisma.reviewIssue.findMany({
			where: {
				reviewSession: {
					repositoryId: repoConnectionId,
				},
			},
		});

		return reviewIssues;
	}
}
