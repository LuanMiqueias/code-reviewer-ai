import { Prisma, ProviderType, RepoConnection, User } from "@prisma/client";

export interface RepoConnectionRepository {
	create(data: Prisma.RepoConnectionCreateInput): Promise<RepoConnection>;
	findById(accountId: string, repoName: string): Promise<RepoConnection | null>;
}
