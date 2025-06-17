import { ProviderType } from "@prisma/client";
import { AccountRepository } from "@/repositories/account.repository";

import { RepoConnectionRepository } from "@/repositories/repo-connection.repository";
import { ProjectSettingsRepository } from "@/repositories/project-settings.repository";
import {
	InvalidCreditialError,
	ResourceAlreadyExistsError,
	ResourceNotFoundError,
} from "../errors/error";
import { RepoClientService } from "@/lib/repo-provider/repo-client.service";
import { deleteTempDir } from "@/utils/delete-temp-files";
import path from "path";
import { getRepoCodeChunks } from "@/utils/get-local-repo-code-chunks";
import { AIService } from "@/lib/ai/ai.service";
import { parseIssuesFromAIResponse } from "@/utils/parse-issues-from-AI-response";
import { ReviewIssueRepository } from "@/repositories/review-issue.repository";
import { ReviewSessionRepository } from "@/repositories/review-session.repository";

interface AnalyzeRepoUseCaseRequest {
	providerUserId: string;
	provider: ProviderType;
	repoName: string;
}

interface AnalyzeRepoUseCaseResponse {
	// projectSettings: ProjectSettings;
	repo: any;
}

export class AnalyzeRepoUseCase {
	constructor(
		private projectSettingsRepository: ProjectSettingsRepository,
		private repoClientService: RepoClientService,
		private accountRepository: AccountRepository,
		private reviewSessionRepository: ReviewSessionRepository,
		private reviewIssueRepository: ReviewIssueRepository,
		private aiService: AIService
	) {}

	async execute({
		providerUserId,
		provider,
		repoName,
	}: AnalyzeRepoUseCaseRequest): Promise<AnalyzeRepoUseCaseResponse> {
		const TEMP_DIR = path.resolve("./temp");
		const LOCAL_REPO_PATH = path.join(TEMP_DIR, repoName);

		const repoConnectionSettings =
			await this.projectSettingsRepository.findByRepoName(repoName);
		const account =
			await this.accountRepository.findByProviderAndProviderUserId(
				provider,
				providerUserId
			);

		if (!account) {
			throw new InvalidCreditialError(`Invalid credentials`);
		}

		if (!repoConnectionSettings) {
			throw new ResourceNotFoundError(
				`Repository ${repoName} not found or has no settings`
			);
		}
		// ----------------------- Clone repo -----------------------
		await this.repoClientService.cloneRepo({
			repoName,
			providerUserName: account.providerUserName,
			token: account.accessToken,
			repoBranch: repoConnectionSettings.RepoConnection.defaultBranch,
		});

		await new Promise((resolve) => setTimeout(resolve, 1000));

		// ----------------------- Get issues from database -----------------------
		const issues = await this.reviewIssueRepository.getAllByReviewSessionId(
			repoConnectionSettings.RepoConnection.id
		);

		// ----------------------- Get code chunks -----------------------
		const chunks = await getRepoCodeChunks(LOCAL_REPO_PATH);

		// ----------------------- Analyze code chunks -----------------------
		const reviews: { title: string; body: string }[] = [];
		const reviewsRaw: string[] = [];

		for (const chunk of chunks) {
			// ----------------------- Generate embedding -----------------------
			const embedding = await this.aiService.generateCodeChunkEmbedding({
				filename: chunk.filename,
				content: chunk.content,
			});
			// ----------------------- Check if issue is duplicate -----------------------
			const isDuplicate = issues.find(
				(issue) => chunk.filename === issue?.filePath
			);
			if (isDuplicate) continue;

			// ----------------------- Analyze code chunk -----------------------
			const review = await this.aiService.analyzeCodeChunk(
				[],
				chunk,
				repoConnectionSettings
			);
			// ----------------------- Parse review -----------------------
			const reviewParsed = parseIssuesFromAIResponse(review);
			if (!reviewParsed) continue;

			// ----------------------- Create issue in memory -----------------------
			const issuesToCreate = {
				title: reviewParsed?.title || "",
				body: reviewParsed?.body || "",
				embedding: embedding,
				filePath: chunk.filename,
			};
			// ----------------------- Create issue in database -----------------------
			await this.reviewSessionRepository.create({
				repository: {
					connect: {
						id: repoConnectionSettings.RepoConnection.id,
					},
				},
				issues: {
					create: [issuesToCreate],
				},
			});

			// ----------------------- Comment on issues -----------------------
			await this.repoClientService.commentOnIssue({
				repoName,
				providerUserName: account.providerUserName,
				token: account.accessToken,
				title: issuesToCreate?.title,
				body: issuesToCreate?.body,
			});

			reviewsRaw.push(review);
			reviews.push(reviewParsed);
		}

		// ----------------------- Delete temp dir -----------------------
		await deleteTempDir(TEMP_DIR);

		return {
			repo: {
				totalChunks: chunks.length,
				reviews,
				reviewsRaw,
			},
		};
	}
}

function cosineSimilarity(a: number[], b: number[]) {
	const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
	const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
	const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
	return dot / (normA * normB);
}
