import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";
import { RepoConnectionRepository } from "../repo-connection.repository copy";

export class PrismaRepoConnectionRepository
	implements RepoConnectionRepository
{
	async create(data: Prisma.RepoConnectionCreateInput) {
		const repoConnection = await prisma.repoConnection.create({
			data,
		});

		return repoConnection;
	}
	async findById(id: string) {
		const repoConnection = await prisma.repoConnection.findUnique({
			where: {
				id,
			},
		});

		return repoConnection;
	}
}
