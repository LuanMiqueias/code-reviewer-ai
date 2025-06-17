import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

// Repositories
import { PrismaUserRepository } from "../../../repositories/prisma/prisma-user-repository";

// Use Cases
import { GetAllExternalRepositoriesUseCase } from "@/use-cases/project/get-all-external-repositories";
import { ProviderType } from "@prisma/client";
import { RepoClientService } from "@/lib/repo-provider/repo-client.service";
import { PrismaAccountRepository } from "@/repositories/prisma/prisma-account-repository";
import { GithubError } from "@/lib/repo-provider/errors/github-error";
import { CreateRepoConnectionUseCase } from "@/use-cases/project/create-repo-connection";
import { PrismaRepoConnectionRepository } from "@/repositories/prisma/prisma-repo-connection-repository";

export const createRepoConnection = async (
	req: FastifyRequest,
	res: FastifyReply
) => {
	const CreateRepoConnectionQuerySchema = z.object({
		repoName: z.string(),
	});

	const { repoName } = CreateRepoConnectionQuerySchema.parse(req.params);

	const { provider, providerUserId } = req.user.sign;

	const repoConnectionRepository = new PrismaRepoConnectionRepository();
	const accountRepository = new PrismaAccountRepository();
	const repoClientService = new RepoClientService(provider);

	const createRepoConnectionUseCase = new CreateRepoConnectionUseCase(
		repoConnectionRepository,
		accountRepository,
		repoClientService
	);

	const data = await createRepoConnectionUseCase.execute({
		providerUserId,
		provider,
		repoName,
	});

	return res.status(200).send(data);
};
