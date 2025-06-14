import { InvalidCreditialError } from "../errors/invalid-credentials-error";
import { UserRepository } from "../../repositories/user.repository";
import { ProviderType, RepoConnection, User } from "@prisma/client";
import { RepoClientService } from "@/infra/repo-provider/repo-client.service";
import { AccountRepository } from "@/repositories/account.repository";
import {
	GithubRepoDTO,
	RepoListItem,
} from "@/infra/repo-provider/types/github-types";
import { mapGithubRepoToRepoListItem } from "@/adapters/github/repo-list-item";
import { RepoConnectionRepository } from "@/repositories/repo-connection.repository";
import { RepoProviderInterface } from "@/infra/repo-provider/repo-client.interface";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";
import { ResourceAlreadyExistsError } from "../errors/resource.already-exists-error";

interface CreateRepoConnectionUseCaseRequest {
	providerUserId: string;
	provider: ProviderType;
	repoName: string;
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
	}: CreateRepoConnectionUseCaseRequest): Promise<CreateRepoConnectionUseCaseResponse> {
		const userAccount =
			await this.accountRepository.findByProviderAndProviderUserId(
				provider,
				providerUserId
			);

		if (!userAccount?.accessToken) {
			throw new InvalidCreditialError();
		}

		const connectionHasExists = await this.repoConnectionRepository.findById(
			userAccount?.id || "",
			repoName
		);

		if (!!connectionHasExists?.id) {
			throw new ResourceAlreadyExistsError(repoName);
		}
		const externalRepo = await this.repoClientService.findRepoByName({
			repoName,
			providerUserName: userAccount?.providerUserName,
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
