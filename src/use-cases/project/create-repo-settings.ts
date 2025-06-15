import { UserRepository } from "../../repositories/user.repository";
import {
	ProjectSettings,
	ProviderType,
	RepoConnection,
	User,
	ProjectType,
	ArchitectureType,
} from "@prisma/client";
import { RepoClientService } from "@/infra/repo-provider/repo-client.service";
import { AccountRepository } from "@/repositories/account.repository";
import {
	GithubRepoDTO,
	RepoListItem,
} from "@/infra/repo-provider/types/github-types";
import { mapGithubRepoToRepoListItem } from "@/adapters/github/repo-list-item";
import { RepoConnectionRepository } from "@/repositories/repo-connection.repository";
import { RepoProviderInterface } from "@/infra/repo-provider/repo-client.interface";
import { ProjectSettingsRepository } from "@/repositories/project-settings.repository";
import {
	InvalidCreditialError,
	ResourceAlreadyExistsError,
	ResourceNotFoundError,
} from "../errors/error";

interface CreateSettingsUseCaseRequest {
	providerUserId: string;
	provider: ProviderType;
	repoName: string;
	settings: {
		projectType: ProjectType;
		architectureType: ArchitectureType;
		language: string;
		codingStyle: string;
		description: string;
	};
}

interface CreateSettingsUseCaseResponse {
	projectSettings: ProjectSettings;
}

export class CreateSettingsUseCase {
	constructor(
		private projectSettingsRepository: ProjectSettingsRepository,
		private repoConnectionRepository: RepoConnectionRepository,
		private accountRepository: AccountRepository
	) {}

	async execute({
		providerUserId,
		provider,
		repoName,
		settings,
	}: CreateSettingsUseCaseRequest): Promise<CreateSettingsUseCaseResponse> {
		const repoConnectionSettingsExists =
			await this.projectSettingsRepository.findByRepoName(repoName);
		if (repoConnectionSettingsExists) {
			throw new ResourceAlreadyExistsError(
				`Repository ${repoName} already has settings`
			);
		}

		const userAccount =
			await this.accountRepository.findByProviderAndProviderUserId(
				provider,
				providerUserId
			);

		if (!userAccount?.accessToken) {
			throw new InvalidCreditialError();
		}

		const repoConnection = await this.repoConnectionRepository.findById(
			userAccount?.id || "",
			repoName
		);

		if (!repoConnection?.id) {
			throw new ResourceNotFoundError(`Repository ${repoName} not found`);
		}

		const projectSettings = await this.projectSettingsRepository.create(
			{
				language: settings.language,
				projectType: settings.projectType,
				architecture: settings.architectureType,
				codingStyle: settings.codingStyle,
				description: settings.description,
				RepoConnection: {
					connect: {
						id: repoConnection.id,
					},
				},
			},
			repoConnection.id
		);

		return {
			projectSettings,
		};
	}
}
