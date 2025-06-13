import { ZodError } from "zod";

export function formatZodError(error: ZodError) {
	return error.errors.map((issue) => ({
		field: issue.path.join("."),
		message: issue.message,
	}));
}
