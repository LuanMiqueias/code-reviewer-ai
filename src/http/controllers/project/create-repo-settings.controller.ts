import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

// Repositories
import { PrismaAccountRepository } from "@/repositories/prisma/prisma-account-repository";
import { PrismaRepoConnectionRepository } from "@/repositories/prisma/prisma-repo-connection-repository";
import { PrismaProjectSettingsRepository } from "@/repositories/prisma/prisma-project-settings-repository";

// Use Cases
import { CreateSettingsUseCase } from "@/use-cases/project/create-repo-settings";

// Types
import { ProjectType } from "@prisma/client";

export const createRepoSettings = async (
	req: FastifyRequest,
	res: FastifyReply
) => {
	const CreateRepoConnectionParamsSchema = z.object({
		repoName: z.string(),
	});
	const CreateRepoSettingsQuerySchema = z.object({
		projectType: z.nativeEnum(ProjectType),
		architectureType: z.string(),
		language: z.string(),
		codingStyle: z.string(),
		description: z.string(),
		entriesFilesToAnalyze: z.array(z.string()),
		entriesFoldersToIgnore: z.array(z.string()),
	});

	const { repoName } = CreateRepoConnectionParamsSchema.parse(req.params);
	const settings = CreateRepoSettingsQuerySchema.parse(req.body);

	const { provider, providerUserId } = req.user.sign;

	const repoConnectionRepository = new PrismaRepoConnectionRepository();
	const accountRepository = new PrismaAccountRepository();
	const projectSettingsRepository = new PrismaProjectSettingsRepository();

	const createRepoSettingsUseCase = new CreateSettingsUseCase(
		projectSettingsRepository,
		repoConnectionRepository,
		accountRepository
	);

	const data = await createRepoSettingsUseCase.execute({
		providerUserId,
		provider,
		repoName,
		settings,
	});

	return res.status(200).send(data);
};
