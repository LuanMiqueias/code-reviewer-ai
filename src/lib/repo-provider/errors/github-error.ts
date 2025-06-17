import { AppError } from "@/use-cases/errors/app-error";

export class GithubError extends AppError {
	constructor(message: string, statusCode: number) {
		super(message, statusCode);
		this.name = "GithubError";
	}
}
