import path from "path";

// Repositories
import { AccountRepository } from "@/repositories/account.repository";
import { ReviewIssueRepository } from "@/repositories/review-issue.repository";
import { ReviewSessionRepository } from "@/repositories/review-session.repository";

import { ProjectSettingsRepository } from "@/repositories/project-settings.repository";

// Services
import { RepoClientService } from "@/lib/repo-provider/repo-client.service";
import { AIService } from "@/lib/ai/ai.service";

// Errors
import { InvalidCreditialError, ResourceNotFoundError } from "../errors/error";

// Utils
import { parseIssuesFromAIResponse } from "@/utils/parse-issues-from-AI-response";
import { deleteTempDir } from "@/utils/delete-temp-files";

// Types
import { ProviderType } from "@prisma/client";
import { cosineSimilarity } from "@/utils/cosine-similarity";
import { processFilesInChunksWithEmbeddings } from "../helpers/process-files-in-chunks-with-embeddings";

interface AnalyzePullRequestUseCaseRequest {
	repoName: string;
	providerUserId: string;
	prNumber: number;
	provider: ProviderType;
	branch: string;
}

interface AnalyzePullRequestUseCaseResponse {
	repo: any;
}

export class AnalyzePullRequestUseCase {
	constructor(
		private projectSettingsRepository: ProjectSettingsRepository,
		private repoClientService: RepoClientService,
		private accountRepository: AccountRepository,
		private reviewSessionRepository: ReviewSessionRepository,
		private reviewIssueRepository: ReviewIssueRepository,
		private aiService: AIService
	) {}

	async execute({
		repoName,
		providerUserId,
		prNumber,
		provider,
		branch,
	}: AnalyzePullRequestUseCaseRequest): Promise<AnalyzePullRequestUseCaseResponse> {
		const TEMP_DIR = path.resolve("./temp");
		const LOCAL_REPO_PATH = path.join(TEMP_DIR, repoName);

		const repoConnectionSettings =
			await this.projectSettingsRepository.findByRepoName(repoName);
		const account =
			await this.accountRepository.findByProviderAndProviderUserId(
				provider,
				providerUserId.toString()
			);

		if (!account && provider !== ProviderType.BITBUCKET) {
			throw new InvalidCreditialError(`Invalid credentials`);
		}

		if (!repoConnectionSettings) {
			throw new ResourceNotFoundError(
				`Repository ${repoName} not found or has no settings`
			);
		}

		const pullRequestFiles = await this.repoClientService.getPullRequest({
			repoName,
			providerUserName: providerUserId,
			prNumber,
			token: account?.accessToken ?? "",
		});

		// ----------------------- Get issues from database -----------------------
		const issues = await this.reviewIssueRepository.getAllByReviewSessionId(
			repoConnectionSettings.RepoConnection.id
		);

		await this.repoClientService.cloneRepo({
			repoName,
			providerUserName: providerUserId,
			token: account?.accessToken ?? "",
			repoBranch: branch,
		});

		console.log(
			"pullRequestFiles",
			pullRequestFiles.filter((file) => {
				if (file.status === "removed") return false;
			})
		);
		// await new Promise((resolve) => setTimeout(resolve, 5000));
		const {
			bigChunks: bigChunksWithEmbedding,
			smallChunks: smallChunksWithEmbedding,
		} = await processFilesInChunksWithEmbeddings({
			LOCAL_REPO_PATH,
			files: pullRequestFiles.filter((file) => file.status !== "removed"),
			entriesFilesToAnalyze: repoConnectionSettings.entriesFilesToAnalyze,
			generateCodeChunkEmbedding: ({ filename, content }) =>
				this.aiService.generateCodeChunkEmbedding({
					filename,
					content,
				}),
		});

		const reviews: { title: string; body: string; filename: string }[] = [];

		for (const chunk of smallChunksWithEmbedding) {
			// ----------------------- Check if issue is duplicate -----------------------
			const isDuplicate = issues.find(
				(issue) => chunk.filename === issue?.filePath
			);
			if (isDuplicate) continue;

			console.log(
				"Analyzing chunk ----------------------",
				chunk.filename,
				chunk.id
			);

			// Filter big chunks to get the most similar chunks - 0.9 is the threshold
			const contexts = bigChunksWithEmbedding.filter(
				(chunkToContext) =>
					chunkToContext.id !== chunk.id &&
					cosineSimilarity(chunk.embedding, chunkToContext.embedding) > 0.9
			);

			// Analyze code chunk with AI
			const review = await this.aiService.analyzeCodeChunk(
				contexts,
				{
					content: chunk.content,
					filename: chunk.filename,
				},
				repoConnectionSettings
			);

			// Parse issues from AI response
			const reviewParsed = parseIssuesFromAIResponse(review);
			if (!reviewParsed) continue;

			reviews.push({
				title: reviewParsed?.title || "",
				body: reviewParsed?.body || "",
				filename: chunk.filename,
			});

			// Comment on pull request -----------------------
			console.log("Commenting on pull request ----------------------");
			await this.repoClientService.commentOnPullRequest({
				repoName,
				providerUserName: providerUserId,
				token: account?.accessToken ?? "",
				prNumber,
				comment: `${reviewParsed.title}\n${reviewParsed.body}`,
			});

			console.log(
				"Waiting 10 seconds to avoid rate limit ----------------------",
				chunk.filename
			);
			await new Promise((resolve) => setTimeout(resolve, 10000));
		}

		await this.reviewSessionRepository.create({
			repository: {
				connect: {
					id: repoConnectionSettings.RepoConnection.id,
				},
			},
			issues: {
				create: reviews?.map((review) => {
					return {
						body: review?.body,
						title: review?.title,
						filePath: review?.filename,
					};
				}),
			},
		});

		console.log("Finished ----------------------");
		// await deleteTempDir(TEMP_DIR);

		return {
			repo: {
				reviews,

				smallChunks: smallChunksWithEmbedding.map((chunk) => {
					return {
						filename: chunk.filename,
						id: chunk.id,
						contexts: bigChunksWithEmbedding
							.filter(
								(chunkToContext) =>
									chunkToContext.id !== chunk.id &&
									cosineSimilarity(chunk.embedding, chunkToContext.embedding) >
										0.9
							)
							.map((chunk) => {
								return {
									filename: chunk.filename,
									id: chunk.id,
								};
							}),
					};
				}),
				totalChunks: smallChunksWithEmbedding.length,
			},
		};
	}
}
