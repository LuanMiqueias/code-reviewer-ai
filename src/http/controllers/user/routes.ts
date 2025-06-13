import { FastifyInstance } from "fastify";

// Controllers
import { createUser } from "./create.controller";
import { authenticate } from "./authenticate.controller";
import { authenticateGithub } from "./github/authenticate-github.controller";
import { authenticateGithubCallback } from "./github/github-callback.controller";
import { getGithubUser } from "./github/github-user.controller";

export const userRoutes = async (app: FastifyInstance) => {
	app.post("/auth/register", createUser);
	app.post("/auth/login", authenticate);
	app.post("/auth/github", authenticateGithub);
	app.get("/auth/github", getGithubUser);
	app.get("/auth/github/callback", authenticateGithubCallback);
};
