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

export const listExternalRepos = async (
	req: FastifyRequest,
	res: FastifyReply
) => {
	const ListExternalReposQuerySchema = z.object({
		page: z.coerce.number().optional().default(1),
	});

	const { page } = ListExternalReposQuerySchema.parse(req.query);

	const { provider, providerUserId } = req.user.sign;

	const repository = new RepoClientService(provider);
	const accountRepository = new PrismaAccountRepository();

	try {
		const listExternalReposUseCase = new GetAllExternalRepositoriesUseCase(
			repository,
			accountRepository
		);

		const data = await listExternalReposUseCase.execute({
			providerUserId,
			provider,
			page,
		});

		return res.status(200).send({
			repositories: data.repositories,
			page: data.page,
		});
	} catch (err) {
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
