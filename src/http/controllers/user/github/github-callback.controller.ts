import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

// Repositories
import { PrismaUserRepository } from "../../../../repositories/prisma/prisma-user-repository";

// Use Cases
import { InvalidCreditialError } from "../../../../use-cases/errors/invalid-credentials-error";
import axios from "axios";

export const authenticateGithubCallback = async (
	req: FastifyRequest,
	res: FastifyReply
) => {
	const AuthenticateQuerySchema = z.object({
		code: z.string(),
	});

	const repository = new PrismaUserRepository();

	try {
		const { code } = AuthenticateQuerySchema.parse(req.query);

		const tokenRes = await axios.post(
			"https://github.com/login/oauth/access_token",
			{
				client_id: process.env.GITHUB_CLIENT_ID,
				client_secret: process.env.GITHUB_CLIENT_SECRET,
				code,
			},
			{
				headers: {
					Accept: "application/json",
				},
			}
		);

		const accessToken = tokenRes.data.access_token;

		// 🔐 Guarde esse token com segurança (criptografado, se possível)
		// 🧠 Opcional: use esse token para buscar os repositórios do usuário
		const userRes = await axios.get("https://api.github.com/user", {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});

		const reposRes = await axios.get("https://api.github.com/user/repos", {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});

		return res.status(200).send({
			githubUser: userRes.data,
			repos: reposRes.data.map((repo: any) => ({
				repo,
			})),
		});
	} catch (err) {
		if (err instanceof InvalidCreditialError) {
			return res.status(404).send({ message: err.message });
		} else {
			return res.status(500).send(); //TODO: fix later
		}
	}
};
