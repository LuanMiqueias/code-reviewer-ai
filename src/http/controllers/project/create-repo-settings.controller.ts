import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

// Repositories
import { PrismaUserRepository } from "../../../repositories/prisma/prisma-user-repository";

// Use Cases
import { GetAllExternalRepositoriesUseCase } from "@/use-cases/project/get-all-external-repositories";
import { ArchitectureType, ProjectType, ProviderType } from "@prisma/client";
import { RepoClientService } from "@/infra/repo-provider/repo-client.service";
import { PrismaAccountRepository } from "@/repositories/prisma/prisma-account-repository";
import { GithubError } from "@/infra/repo-provider/errors/github-error";
import { CreateRepoConnectionUseCase } from "@/use-cases/project/create-repo-connection";
import { PrismaRepoConnectionRepository } from "@/repositories/prisma/prisma-repo-connection-repository";
import { CreateSettingsUseCase } from "@/use-cases/project/create-repo-settings";
import { PrismaProjectSettingsRepository } from "@/repositories/prisma/prisma-project-settings-repository";

export const createRepoSettings = async (
	req: FastifyRequest,
	res: FastifyReply
) => {
	const CreateRepoConnectionParamsSchema = z.object({
		repoName: z.string(),
	});
	const CreateRepoSettingsQuerySchema = z.object({
		projectType: z.nativeEnum(ProjectType),
		architectureType: z.nativeEnum(ArchitectureType),
		language: z.string(),
		codingStyle: z.string(),
		description: z.string(),
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
