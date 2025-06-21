import { ProviderType, RepoConnection } from "@prisma/client";
import { RepoClientService } from "@/lib/repo-provider/repo-client.service";
import { AccountRepository } from "@/repositories/account.repository";
import { RepoConnectionRepository } from "@/repositories/repo-connection.repository";
import {
	InvalidCreditialError,
	ResourceAlreadyExistsError,
	ResourceNotFoundError,
} from "../errors/error";

interface CreateRepoConnectionUseCaseRequest {
	providerUserId: string;
	provider: ProviderType;
	repoName: string;
	workspaceSlug?: string;
}

interface CreateRepoConnectionUseCaseResponse {
	repoConnection: RepoConnection;
}

export class CreateRepoConnectionUseCase {
	constructor(
		private repoConnectionRepository: RepoConnectionRepository,
		private accountRepository: AccountRepository,
		private repoClientService: RepoClientService
	) {}

	async execute({
		providerUserId,
		provider,
		repoName,
		workspaceSlug,
	}: CreateRepoConnectionUseCaseRequest): Promise<CreateRepoConnectionUseCaseResponse> {
		const userAccount =
			await this.accountRepository.findByProviderAndProviderUserId(
				provider,
				providerUserId
			);

		if (!userAccount?.accessToken) {
			throw new InvalidCreditialError();
		}
		const repoClientUser = await this.repoClientService.fetchUser(
			userAccount?.accessToken
		);
		const connectionHasExists = await this.repoConnectionRepository.findById(
			userAccount?.id || "",
			repoName
		);

		if (!!connectionHasExists?.id) {
			throw new ResourceAlreadyExistsError(repoName);
		}
		const externalRepo = await this.repoClientService.findRepoByName({
			repoName,
			providerUserName: workspaceSlug || userAccount?.providerUserName,
			token: userAccount?.accessToken,
		});

		if (!externalRepo) {
			throw new ResourceNotFoundError(repoName);
		}
		const repoConnection = await this.repoConnectionRepository.create({
			name: externalRepo.name,
			cloneUrl: externalRepo.clone_url,
			defaultBranch: externalRepo.default_branch,
			language: externalRepo.language || "",
			ownerName: externalRepo.owner.login,
			provider,
			account: {
				connect: { id: userAccount.id },
			},
		});

		return {
			repoConnection: repoConnection,
		};
	}
}
