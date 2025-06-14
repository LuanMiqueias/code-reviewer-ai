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
	providerUserId: string;
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
		const { accessToken: accessTokenGitHub } =
			await this.repoClientService.exchangeCodeForToken(code);
		const repoClientUser = await this.repoClientService.fetchUser(
			accessTokenGitHub
		);

		if (
			!repoClientUser?.id ||
			(!repoClientUser?.login && !repoClientUser?.name)
		) {
			throw new InvalidCreditialError();
		}

		const account =
			await this.accountRepository.findByProviderAndProviderUserId(
				ProviderType.GITHUB,
				repoClientUser.id.toString()
			);

		if (account) {
			await this.accountRepository.updateProviderAccessToken(
				account.id,
				accessTokenGitHub
			);
			return {
				user: account.user,
				providerUserId: account.providerUserId,
			};
		}

		const user = await this.userRepository.create({
			email: repoClientUser.email,
			name: repoClientUser.name || repoClientUser.login,
			passwordHash: "",
			account: {
				create: {
					provider: ProviderType.GITHUB,
					providerUserId: repoClientUser.id.toString(),
					accessToken: accessTokenGitHub,
					providerUserName: repoClientUser.login,
				},
			},
		});

		return { user, providerUserId: repoClientUser.id.toString() };
	}
}
