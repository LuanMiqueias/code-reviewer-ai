import { FastifyInstance } from "fastify";
import { verifyJWT } from "@/http/middlewares/verify-jwt";

// Controllers
import { listExternalRepos } from "./list-external-repos.controller";

export const projectRoutes = async (app: FastifyInstance) => {
	app.get(
		"/projects/list-external-repos",
		{ preHandler: [verifyJWT] },
		listExternalRepos
	);
};
