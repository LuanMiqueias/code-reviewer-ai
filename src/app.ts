import fastify from "fastify";

// Components
import cors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import { ZodError } from "zod";

// Env
import { env } from "./env";

// Routes
import { userRoutes } from "./http/controllers/user/routes";
import { formatZodError } from "./utils/format-zod-error";
import { projectRoutes } from "./http/controllers/project/routes";
import { GithubError } from "./lib/repo-provider/errors/github-error";
import {
	ErrorProcessingFilesInChunksWithEmbeddings,
	InvalidCreditialError,
	ResourceAlreadyExistsError,
	ResourceNotFoundError,
} from "./use-cases/errors/error";
import { GeminiError } from "./lib/ai/providers/errors/gemini-error";

export const app = fastify();

app.register(cors, {
	origin: "*",
});

app.register(fastifyJwt, {
	secret: env.JWT_SECRET,
	sign: {
		expiresIn: "7d",
	},
});

app.register(userRoutes);
app.register(projectRoutes);

app.setErrorHandler((error, req, res) => {
	if (error instanceof ZodError) {
		const formattedErrors = formatZodError(error);
		return res.status(400).send({
			message: "Validation Error",
			errors: formattedErrors,
		});
	}

	if (env.NODE_ENV === "dev") {
		console.log(error);
	}
	const errorMap = new Map<Function, number>([
		[ResourceNotFoundError, 400],
		[ResourceAlreadyExistsError, 400],
		[InvalidCreditialError, 401],
		[ErrorProcessingFilesInChunksWithEmbeddings, 500],
		[GithubError, 500],
		[GeminiError, 500],
	]);

	for (const [ErrorClass, status] of errorMap.entries()) {
		if (error instanceof ErrorClass) {
			const statusCode =
				error instanceof GithubError && error.statusCode
					? error.statusCode
					: status;

			return res.status(statusCode).send({ message: error.message });
		}
	}
	return res.status(500).send({ message: "Internal Server Error" });
});
