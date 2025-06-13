import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

// Repositories

// Use Cases
import { InvalidCreditialError } from "../../../../use-cases/errors/invalid-credentials-error";

export const authenticateGithub = async (
	req: FastifyRequest,
	res: FastifyReply
) => {
	try {
		const redirectUri = "http://localhost:3000/api/auth/github/callback";
		const githubUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=repo`;

		return res.status(200).send({ githubUrl });
	} catch (err) {
		if (err instanceof InvalidCreditialError) {
			return res.status(404).send({ message: err.message });
		} else {
			return res.status(500).send(); //TODO: fix later
		}
	}
};
