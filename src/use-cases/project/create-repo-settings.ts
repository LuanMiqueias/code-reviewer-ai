import { ProjectSettings, ProviderType, ProjectType } from "@prisma/client";
import path from "path";

// Repositories
import { AccountRepository } from "@/repositories/account.repository";
import { RepoConnectionRepository } from "@/repositories/repo-connection.repository";
import { ProjectSettingsRepository } from "@/repositories/project-settings.repository";

// Errors
import {
	InvalidCreditialError,
	ResourceAlreadyExistsError,
	ResourceNotFoundError,
} from "../errors/error";
import { getRepoCodeChunks } from "@/utils/get-local-repo-code-chunks";
import { RepoClientService } from "@/lib/repo-provider/repo-client.service";
import { AIService } from "@/lib/ai/ai.service";

interface CreateSettingsUseCaseRequest {
	providerUserId: string;
	provider: ProviderType;
	repoName: string;
	settings: {
		projectType: ProjectType;
		architectureType: string;
		language: string;
		codingStyle: string;
		description: string;
		entriesFilesToAnalyze?: string[];
		entriesFoldersToIgnore?: string[];
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
		const TEMP_DIR = path.resolve("./temp");
		const LOCAL_REPO_PATH = path.join(TEMP_DIR, repoName);

		const repoConnectionSettingsExists =
			await this.projectSettingsRepository.findByRepoName(repoName);
		if (repoConnectionSettingsExists) {
			throw new ResourceAlreadyExistsError(
				`Repository ${repoName} already has settings`
			);
		}

		const account =
			await this.accountRepository.findByProviderAndProviderUserId(
				provider,
				providerUserId.toString()
			);

		if (!account) {
			throw new InvalidCreditialError(`Invalid credentials`);
		}

		const repoConnection = await this.repoConnectionRepository.findById(
			account?.id || "",
			repoName
		);

		if (!repoConnection?.id) {
			throw new ResourceNotFoundError(`Repository ${repoName} not found`);
		}

		// TODO: Remove later
		// await this.repoClientService.cloneRepo({
		// 	repoName,
		// 	providerUserName: account.providerUserName,
		// 	token: account.accessToken,
		// 	repoBranch: repoConnection.defaultBranch,
		// });
		// await new Promise((resolve) => setTimeout(resolve, 5000));

		// const chunks = await getRepoCodeChunks(
		// 	LOCAL_REPO_PATH,
		// 	4000,
		// 	settings.entriesFilesToAnalyze,
		// 	settings.entriesFoldersToIgnore
		// );
		// const chunksWithEmbedding = await Promise.all(
		// 	chunks.map(async (chunk) => {
		// 		const embedding = await this.aiService.generateCodeChunkEmbedding({
		// 			filename: chunk.filename,
		// 			content: chunk.content,
		// 		});
		// 		return {
		// 			...chunk,
		// 			embedding,
		// 		};
		// 	})
		// );

		const projectSettings = await this.projectSettingsRepository.create(
			{
				language: settings.language,
				projectType: settings.projectType,
				architecture: settings.architectureType,
				codingStyle: settings.codingStyle,
				description: settings.description,
				entriesFilesToAnalyze: settings.entriesFilesToAnalyze || [],
				entriesFoldersToIgnore: settings.entriesFilesToAnalyze || [],
				RepoConnection: {
					connect: {
						id: repoConnection.id,
					},
				},
				// TODO: Remove later
				// embeddings: {
				// 	createMany: {
				// 		data: chunksWithEmbedding.map((chunk) => ({
				// 			embedding: chunk.embedding,
				// 			filePath: chunk.filename,
				// 		})),
				// 	},
				// },
			},
			repoConnection.id
		);

		return {
			projectSettings,
		};
	}
}
