import { Prisma, ProviderType, RepoConnection, User } from "@prisma/client";

export interface RepoConnectionRepository {
	create(data: Prisma.RepoConnectionCreateInput): Promise<RepoConnection>;
	findById(id: string): Promise<RepoConnection | null>;
}
