import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

// Repositories

// Use Cases
import { InvalidCreditialError } from "@/use-cases/errors/invalid-credentials-error";
import { AuthenticateUseCase } from "@/use-cases/user/github-authenticate";
import { PrismaUserRepository } from "@/repositories/prisma/prisma-user-repository";
import { PrismaAccountRepository } from "@/repositories/prisma/prisma-account-repository";
import { RepoClientService } from "@/infra/repo-provider/repo-client.service";
import { ProviderType } from "@prisma/client";
export const githubCallback = async (
	req: FastifyRequest,
	res: FastifyReply
) => {
	const AuthenticateQuerySchema = z.object({
		code: z.string(),
	});

	try {
		const { code } = AuthenticateQuerySchema.parse(req.query);

		const userRepository = new PrismaUserRepository();
		const accountRepository = new PrismaAccountRepository();
		const repoClientService = new RepoClientService(ProviderType.GITHUB);

		const authenticateUseCase = new AuthenticateUseCase(
			userRepository,
			repoClientService,
			accountRepository
		);

		const { user, accessToken } = await authenticateUseCase.execute({ code });

		return res.status(200).send({ user, accessToken });
	} catch (err) {
		if (err instanceof InvalidCreditialError) {
			return res.status(404).send({ message: err.message });
		} else {
			return res.status(500).send(); //TODO: fix later
		}
	}
};
