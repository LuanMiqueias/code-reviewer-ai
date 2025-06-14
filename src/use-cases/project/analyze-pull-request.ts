import {
	ProjectSettings,
	ProviderType,
	ProjectType,
	ArchitectureType,
} from "@prisma/client";
import { AccountRepository } from "@/repositories/account.repository";

import { RepoConnectionRepository } from "@/repositories/repo-connection.repository";
import { ProjectSettingsRepository } from "@/repositories/project-settings.repository";
import {
	InvalidCreditialError,
	ResourceAlreadyExistsError,
	ResourceNotFoundError,
} from "../errors/error";
import { RepoClientService } from "@/infra/repo-provider/repo-client.service";
import { deleteTempDir } from "@/utils/delete-temp-files";
import path from "path";
import {
	getFileCodeChunks,
	getRepoCodeChunks,
} from "@/utils/get-local-repo-code-chunks";
import { AIService } from "@/lib/ai/ai.service";
import { parseIssuesFromAIResponse } from "@/utils/parse-issues-from-AI-response";
import { ReviewIssueRepository } from "@/repositories/review-issue.repository";
import { ReviewSessionRepository } from "@/repositories/review-session.repository";

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

		// Deletar tmp (delete temp directory before proceeding)

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

		const pullRequestFiles = await this.repoClientService.getPullRequest({
			repoName,
			providerUserName: account.providerUserName,
			prNumber,
			token: account.accessToken,
		});

		await this.repoClientService.cloneRepo({
			repoName,
			providerUserName: account.providerUserName,
			token: account.accessToken,
			repoBranch: branch,
		});
		await new Promise((resolve) => setTimeout(resolve, 1000));

		const chunks: { filename: string; content: string }[] = [];
		const chunksRaw: { filename: string; content: string }[] = [];

		await Promise.all(
			pullRequestFiles.map(async (file) => {
				if (!/\.(ts|js|tsx|jsx)$/.test(file.filename)) {
					return;
				}
				const fileContent = await getFileCodeChunks(
					LOCAL_REPO_PATH,
					file.filename,
					4000
				);
				chunksRaw.push(...fileContent);
			})
		);

		chunks.push(...chunksRaw);

		const issues = await this.reviewIssueRepository.getAllByReviewSessionId(
			repoConnectionSettings.RepoConnection.id
		);

		const reviews: { title: string; body: string; filename: string }[] = [];
		const reviewsRaw: string[] = [];

		for (const chunk of chunks) {
			const embedding = await this.aiService.generateCodeChunkEmbedding({
				filename: chunk.filename,
				content: chunk.content,
			});
			const isDuplicate = issues.some(
				(issue) => cosineSimilarity(issue.embedding, embedding) > 0.9
			);
			if (isDuplicate) continue;

			const review = await this.aiService.analyzeCodeChunk(
				chunk,
				repoConnectionSettings
			);
			const reviewParsed = parseIssuesFromAIResponse(review);
			if (!reviewParsed) continue;

			const issuesToCreate = {
				title: reviewParsed?.title || "",
				body: reviewParsed?.body || "",
				embedding: embedding,
			};

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
			reviewsRaw.push(review);
			reviews.push({
				title: reviewParsed?.title || "",
				body: reviewParsed?.body || "",
				filename: chunk.filename,
			});
		}
		await Promise.all(
			reviews.map(async (review) => {
				if (review.body === "") return;
				await this.repoClientService.commentOnPullRequest({
					repoName,
					providerUserName: account.providerUserName,
					token: account.accessToken,
					prNumber,
					comment: `${review.filename}\n${review.title}\n${review.body}`,
				});
			})
		);
		const fs = require("fs");
		if (fs.existsSync(TEMP_DIR)) {
			fs.rmSync(TEMP_DIR, { recursive: true, force: true });
		}
		return {
			repo: {
				reviews,
				chunks,
				totalChunks: chunks.length,
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
