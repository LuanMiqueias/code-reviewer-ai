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

	return res.status(500).send({ message: "Internal Server Error" });
});
