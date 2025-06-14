import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

// Repositories
import { PrismaUserRepository } from "../../../repositories/prisma/prisma-user-repository";

// Use Cases
import { UserAlreadyExistsError } from "../../../use-cases/errors/user.already-exists-error";
import { GetAllExternalRepositoriesUseCase } from "@/use-cases/project/get-all-external-repositories";
import { ProviderType } from "@prisma/client";
import { RepoClientService } from "@/infra/repo-provider/repo-client.service";
import { PrismaAccountRepository } from "@/repositories/prisma/prisma-account-repository";
import { InvalidCreditialError } from "@/use-cases/errors/invalid-credentials-error";
import { GithubError } from "@/infra/repo-provider/errors/github-error";
import { CreateRepoConnectionUseCase } from "@/use-cases/project/create-repo-connection";
import { PrismaRepoConnectionRepository } from "@/repositories/prisma/prisma-repo-connection-repository";
import { ResourceAlreadyExistsError } from "@/use-cases/errors/resource.already-exists-error";
import { ResourceNotFoundError } from "@/use-cases/errors/resource-not-found-error";

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

	try {
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
	} catch (err) {
		if (err instanceof ResourceNotFoundError) {
			return res.status(400).send({ message: err.message });
		}
		if (err instanceof ResourceAlreadyExistsError) {
			return res.status(400).send({ message: err.message });
		}
		if (err instanceof GithubError) {
			return res.status(err.statusCode || 500).send({ message: err.message });
		}
		if (err instanceof InvalidCreditialError) {
			return res.status(401).send({ message: err.message });
		}
		return res.status(500).send({
			message: "Internal server error",
		});
	}
};
