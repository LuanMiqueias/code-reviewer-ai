import { FastifyInstance } from "fastify";
import { verifyJWT } from "@/http/middlewares/verify-jwt";

// Controllers
import { listExternalRepos } from "./list-external-repos.controller";
import { createRepoConnection } from "./create-repo-connection.controller";
import { createRepoSettings } from "./create-repo-settings.controller";
import { analyzeRepoController } from "./analyze-all-repo.controller";
import { githubWebhookController } from "./handle-pull-request-github.controller";
import { bitbucketWebhookController } from "./handle-pull-request-bitbucket.controller";

export const projectRoutes = async (app: FastifyInstance) => {
	app.get(
		"/projects/list/external-repos",
		{ preHandler: [verifyJWT] },
		listExternalRepos
	);
	app.post(
		"/projects/create/connection/:repoName/:workspaceSlug?",
		{ preHandler: [verifyJWT] },
		createRepoConnection
	);
	app.post(
		"/projects/create/settings/:repoName",
		{ preHandler: [verifyJWT] },
		createRepoSettings
	);
	app.get(
		"/projects/analyze/repo/:repoName",
		{ preHandler: [verifyJWT] },
		analyzeRepoController
	);
	app.post("/webhook/github/pull-request", githubWebhookController);
	app.post("/webhook/bitbucket/pull-request", bitbucketWebhookController);
};
