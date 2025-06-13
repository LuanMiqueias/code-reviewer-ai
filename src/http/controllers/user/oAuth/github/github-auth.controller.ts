import { FastifyReply, FastifyRequest } from "fastify";

import { InvalidCreditialError } from "@/use-cases/errors/invalid-credentials-error";
import { env } from "@/env";

export const authenticateGithub = async (
	req: FastifyRequest,
	res: FastifyReply
) => {
	try {
		const redirectUri = "http://localhost:3000/api/auth/github/callback";
		const githubUrl = `https://github.com/login/oauth/authorize?client_id=${env.GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=repo`;

		return res.status(200).send({ githubUrl });
	} catch (err) {
		return res.status(500).send();
	}
};
