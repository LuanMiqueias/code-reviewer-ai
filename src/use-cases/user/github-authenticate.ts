import { InvalidCreditialError } from "../errors/invalid-credentials-error";
import { UserRepository } from "../../repositories/user.repository";
import { ProviderType, User } from "@prisma/client";
import { RepoClientService } from "@/infra/repo-provider/repo-client.service";
import { AccountRepository } from "@/repositories/account.repository";

interface AuthenticateUseCaseRequest {
	code: string;
}

interface AuthenticateUseCaseResponse {
	user: User;
	accessToken: string;
}

export class AuthenticateUseCase {
	constructor(
		private userRepository: UserRepository,
		private repoClientService: RepoClientService,
		private accountRepository: AccountRepository
	) {}

	async execute({
		code,
	}: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
		const { accessToken } = await this.repoClientService.exchangeCodeForToken(
			code
		);
		const repoClientUser = await this.repoClientService.fetchUser(accessToken);

		if (
			!repoClientUser?.id ||
			!repoClientUser?.email ||
			!repoClientUser?.name
		) {
			throw new InvalidCreditialError();
		}

		const account =
			await this.accountRepository.findByProviderAndProviderUserId(
				ProviderType.GITHUB,
				repoClientUser.id.toString()
			);

		if (account) {
			return {
				user: account.user,
				accessToken,
			};
		}

		const user = await this.userRepository.create({
			email: repoClientUser.email,
			name: repoClientUser.name,
			passwordHash: "",
			account: {
				create: {
					provider: ProviderType.GITHUB,
					providerUserId: repoClientUser.id.toString(),
					accessToken,
				},
			},
		});

		return { user, accessToken };
	}
}
