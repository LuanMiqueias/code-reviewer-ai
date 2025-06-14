import { prisma } from "../../lib/prisma";
import { Prisma, ProviderType } from "@prisma/client";
import { RepoConnectionRepository } from "../repo-connection.repository";

export class PrismaRepoConnectionRepository
	implements RepoConnectionRepository
{
	async create(data: Prisma.RepoConnectionCreateInput) {
		const repoConnection = await prisma.repoConnection.create({
			data,
		});

		return repoConnection;
	}
	async findById(accountId: string, repoName: string) {
		console.log("accountId", accountId);
		console.log("repoName", repoName);
		const repoConnection = await prisma.repoConnection.findUnique({
			where: {
				accountId_name: {
					accountId,
					name: repoName,
				},
			},
		});

		return repoConnection;
	}
}
