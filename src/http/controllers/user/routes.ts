import { FastifyInstance } from "fastify";

// Controllers
import { createUser } from "./create.controller";
import { authenticate } from "./authenticate.controller";
import { githubCallback } from "./oAuth/github/github-callback.controller";
import { authenticateGithub } from "./oAuth/github/github-auth.controller";
import { authenticateBitbucket } from "./oAuth/bitbucket/bitbucket-auth.controller";
import { bitbucketCallback } from "./oAuth/bitbucket/bitbucket-callback.controller";

export const userRoutes = async (app: FastifyInstance) => {
	app.post("/auth/register", createUser);
	app.post("/auth/login", authenticate);
	app.post("/auth/github", authenticateGithub);
	app.post("/auth/github/callback", githubCallback);
	app.post("/auth/bitbucket", authenticateBitbucket);
	app.post("/auth/bitbucket/callback", bitbucketCallback);
	// app.get("/auth/github", getGithubUser);
};
