// src/core/errors/app-error.ts
export class AppError extends Error {
	constructor(public message: string, public statusCode = 400) {
		super(message);
	}
}
