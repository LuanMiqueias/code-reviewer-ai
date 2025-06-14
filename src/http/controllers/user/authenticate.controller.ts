import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

// Repositories
import { PrismaUserRepository } from "../../../repositories/prisma/prisma-user-repository";

// Use Cases
import { AuthenticateUseCase } from "../../../use-cases/user/authenticate";

export const authenticate = async (req: FastifyRequest, res: FastifyReply) => {
	const AuthenticateBodySchema = z.object({
		email: z.string().email(),
		password: z.string(),
	});

	const repository = new PrismaUserRepository();
	const authenticateUseCase = new AuthenticateUseCase(repository);

	const { email, password } = AuthenticateBodySchema.parse(req.body);

	const { user } = await authenticateUseCase.execute({
		email,
		password,
	});

	const token = await res.jwtSign(
		{},
		{
			sign: {
				sub: user?.id,
			},
		}
	);
	return res.status(200).send({
		token,
	});
};
