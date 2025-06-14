import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";
import { ProjectSettingsRepository } from "../project-settings.repository";

export class PrismaProjectSettingsRepository
	implements ProjectSettingsRepository
{
	async create(
		data: Prisma.ProjectSettingsCreateInput,
		repoConnectionId: string
	) {
		const projectSettings = await prisma.projectSettings.create({
			data: {
				...data,
				RepoConnection: {
					connect: {
						id: repoConnectionId,
					},
				},
			},
		});

		return projectSettings;
	}
	async findById(id: string) {
		const projectSettings = await prisma.projectSettings.findUnique({
			where: {
				id,
			},
		});

		return projectSettings;
	}
	async findByRepoConnectionId(repoConnectionId: string) {
		const projectSettings = await prisma.projectSettings.findFirst({
			where: {
				RepoConnection: {
					id: repoConnectionId,
				},
			},
		});

		return projectSettings;
	}
	async findByRepoName(repoName: string) {
		const projectSettings = await prisma.projectSettings.findUnique({
			where: {
				repositoryId: repoName,
			},
			include: {
				RepoConnection: true,
			},
		});

		return projectSettings;
	}
}
