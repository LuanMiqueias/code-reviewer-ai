import { FastifyInstance } from "fastify";
import { verifyJWT } from "@/http/middlewares/verify-jwt";

// Controllers
import { listExternalRepos } from "./list-external-repos.controller";
import { createRepoConnection } from "./create-repo-connection.controller";

export const projectRoutes = async (app: FastifyInstance) => {
	app.get(
		"/projects/list-external-repos",
		{ preHandler: [verifyJWT] },
		listExternalRepos
	);
	app.post(
		"/projects/create-connection/:repoName",
		{ preHandler: [verifyJWT] },
		createRepoConnection
	);
};
