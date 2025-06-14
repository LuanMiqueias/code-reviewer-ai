import { FastifyInstance } from "fastify";
import { verifyJWT } from "@/http/middlewares/verify-jwt";

// Controllers
import { listExternalRepos } from "./list-external-repos.controller";
import { createRepoConnection } from "./create-repo-connection.controller";
import { createRepoSettings } from "./create-repo-settings.controller";
import { cloneExternalRepo } from "./clone-external-repo.controller";
import { githubWebhookController } from "./handle-pull-request-github.controller";

export const projectRoutes = async (app: FastifyInstance) => {
	app.get(
		"/projects/list/external-repos",
		{ preHandler: [verifyJWT] },
		listExternalRepos
	);
	app.post(
		"/projects/create/connection/:repoName",
		{ preHandler: [verifyJWT] },
		createRepoConnection
	);
	app.post(
		"/projects/create/settings/:repoName",
		{ preHandler: [verifyJWT] },
		createRepoSettings
	);
	app.get(
		"/projects/clone/external-repo/:repoName",
		{ preHandler: [verifyJWT] },
		cloneExternalRepo
	);
	app.post("/webhook/github/pull-request", githubWebhookController);
};
