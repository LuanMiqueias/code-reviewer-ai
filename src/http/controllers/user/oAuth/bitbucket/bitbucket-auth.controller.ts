import { FastifyReply, FastifyRequest } from "fastify";

import { env } from "@/env";

export const authenticateBitbucket = async (
	req: FastifyRequest,
	res: FastifyReply
) => {
	const redirectUri = "http://localhost:3000/auth/bitbucket/callback";
	const bitbucketUrl = `https://bitbucket.org/site/oauth2/authorize?client_id=${env.BITBUCKET_CLIENT_ID}&response_type=code&redirect_uri=${redirectUri}`;

	return res.status(200).send({ bitbucketUrl });
};
