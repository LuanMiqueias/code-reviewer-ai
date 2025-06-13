import { Prisma, RepoConnection } from "@prisma/client";

export interface RepoConnectionRepository {
	create(data: Prisma.RepoConnectionCreateInput): Promise<RepoConnection>;
	findById(id: string): Promise<RepoConnection | null>;
}
