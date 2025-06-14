import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";
import { ReviewSessionRepository } from "../review-session.repository";

export class PrismaReviewSessionRepository implements ReviewSessionRepository {
	async create(data: Prisma.ReviewSessionCreateInput) {
		const reviewSession = await prisma.reviewSession.create({
			data,
		});

		return reviewSession;
	}

	async findById(id: string) {
		const reviewSession = await prisma.reviewSession.findUnique({
			where: {
				id,
			},
		});

		return reviewSession;
	}
}
