import { AppError } from "./app-error";

export class InvalidCreditialError extends AppError {
	constructor(message?: string) {
		super(message || "Invalid credentials.", 401);
	}
}

export class ResourceNotFoundError extends AppError {
	constructor(message?: string) {
		super(message || "Resource not found.", 404);
	}
}

export class ResourceAlreadyExistsError extends AppError {
	constructor(message?: string) {
		super(message || "Resource already exists.", 400);
	}
}

export class UserAlreadyExistsError extends AppError {
	constructor(message?: string) {
		super(message || "User already exists.", 400);
	}
}
