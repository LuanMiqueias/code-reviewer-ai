import { Prisma, ReviewSession } from "@prisma/client";

export interface ReviewSessionRepository {
	create(data: Prisma.ReviewSessionCreateInput): Promise<ReviewSession>;
	findById(id: string): Promise<ReviewSession | null>;
}
