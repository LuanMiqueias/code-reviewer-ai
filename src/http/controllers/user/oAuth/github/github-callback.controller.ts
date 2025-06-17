import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

// Repositories

// Use Cases
import { AuthenticateUseCase } from "@/use-cases/user/github-authenticate";
import { PrismaUserRepository } from "@/repositories/prisma/prisma-user-repository";
import { PrismaAccountRepository } from "@/repositories/prisma/prisma-account-repository";
import { RepoClientService } from "@/lib/repo-provider/repo-client.service";
import { ProviderType } from "@prisma/client";
import { InvalidCreditialError } from "@/use-cases/errors/error";
export const githubCallback = async (
	req: FastifyRequest,
	res: FastifyReply
) => {
	const AuthenticateQuerySchema = z.object({
		code: z.string(),
	});

	const { code } = AuthenticateQuerySchema.parse(req.query);

	const userRepository = new PrismaUserRepository();
	const accountRepository = new PrismaAccountRepository();
	const repoClientService = new RepoClientService(ProviderType.GITHUB);

	const authenticateUseCase = new AuthenticateUseCase(
		userRepository,
		repoClientService,
		accountRepository
	);

	const { user, providerUserId } = await authenticateUseCase.execute({
		code,
	});

	const token = await res.jwtSign({
		sign: {
			sub: user.id,
			providerUserId: providerUserId,
			provider: ProviderType.GITHUB,
		},
	});

	return res.status(200).send({ user, token });
};
