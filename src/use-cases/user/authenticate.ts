import { compare, hash } from "bcryptjs";
import { UserRepository } from "../../repositories/user.repository";
import { User } from "@prisma/client";
import { InvalidCreditialError } from "../errors/error";

interface AuthenticateUseCaseRequest {
	email: string;
	password: string;
}

interface AuthenticateUseCaseResponse {
	user: User;
}

export class AuthenticateUseCase {
	constructor(private userRepository: UserRepository) {}

	async execute({
		email,
		password,
	}: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
		const user = await this.userRepository.findByEmail(email);

		if (!user) {
			throw new InvalidCreditialError();
		}

		const doesPasswordMatches = await compare(password, user?.passwordHash);

		if (!doesPasswordMatches) {
			throw new InvalidCreditialError();
		}

		return { user };
	}
}
