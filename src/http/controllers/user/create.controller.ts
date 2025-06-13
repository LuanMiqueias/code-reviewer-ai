import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

// Repositories
import { PrismaUserRepository } from "../../../repositories/prisma/prisma-user-repository";

// Use Cases
import { CreateUserUseCase } from "../../../use-cases/user/register";
import { UserAlreadyExistsError } from "../../../use-cases/errors/user.already-exists-error";

export const createUser = async (req: FastifyRequest, res: FastifyReply) => {
	const createUserBodySchema = z.object({
		name: z.string(),
		email: z.string().email(),
		password: z.string().min(6),
	});

	const repository = new PrismaUserRepository();
	const createUserUseCase = new CreateUserUseCase(repository);

	const { name, email, password } = createUserBodySchema.parse(req.body);

	try {
		await createUserUseCase.execute({
			name,
			email,
			password,
		});
		return res.status(201).send();
	} catch (err) {
		if (err instanceof UserAlreadyExistsError) {
			return res.status(409).send({ message: err.message });
		}
		return res.status(500).send({
			message: "Internal server error",
		});
	}
};
