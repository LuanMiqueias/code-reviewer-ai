import { UserRepository } from "../../repositories/user.repository";
import { ProviderType, User } from "@prisma/client";
import { RepoClientService } from "@/lib/repo-provider/repo-client.service";
import { AccountRepository } from "@/repositories/account.repository";
import { RepoListItem } from "@/lib/repo-provider/types/common-types";
import { mapCommonRepoToRepoListItem } from "@/adapters/common/repo-list-item";
import { InvalidCreditialError } from "../errors/error";

interface GetAllExternalRepositoriesUseCaseRequest {
	providerUserId: string;
	provider: ProviderType;
	page: number;
}

interface GetAllExternalRepositoriesUseCaseResponse {
	repositories: RepoListItem[];
	page: number;
}

export class GetAllExternalRepositoriesUseCase {
	constructor(
		private repoClientService: RepoClientService,
		private accountRepository: AccountRepository
	) {}

	async execute({
		providerUserId,
		provider,
		page,
	}: GetAllExternalRepositoriesUseCaseRequest): Promise<GetAllExternalRepositoriesUseCaseResponse> {
		const userAccount =
			await this.accountRepository.findByProviderAndProviderUserId(
				provider,
				providerUserId
			);

		if (!userAccount?.accessToken) {
			throw new InvalidCreditialError();
		}

		const repoClientUser = await this.repoClientService.getRepos(
			userAccount?.accessToken,
			page,
			30
		);

		console.log(repoClientUser.data);
		return {
			repositories: repoClientUser.data.map(mapCommonRepoToRepoListItem),
			page: repoClientUser.page,
		};
	}
}
