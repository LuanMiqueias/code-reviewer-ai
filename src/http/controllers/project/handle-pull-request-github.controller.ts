import { AIService } from "@/lib/ai/ai.service";
import { PrismaAccountRepository } from "@/repositories/prisma/prisma-account-repository";
import { PrismaProjectSettingsRepository } from "@/repositories/prisma/prisma-project-settings-repository";
import { PrismaReviewSessionRepository } from "@/repositories/prisma/prisma-review-session-repository";
import { PrismaReviewIssueRepository } from "@/repositories/prisma/prisma-review-issue-repository";
import { RepoClientService } from "@/lib/repo-provider/repo-client.service";
import { FastifyRequest, FastifyReply } from "fastify";
import { ProviderType } from "@prisma/client";
import { AnalyzePullRequestUseCase } from "@/use-cases/project/analyze-pull-request";

export async function githubWebhookController(
	req: FastifyRequest,
	res: FastifyReply
) {
	const event = req.headers["x-github-event"];
	const payload = req.body as any;

	const projectSettingsRepository = new PrismaProjectSettingsRepository();
	const accountRepository = new PrismaAccountRepository();
	const repoClientService = new RepoClientService("GITHUB");
	const aiService = new AIService("gemini");
	const reviewIssueRepository = new PrismaReviewIssueRepository();
	const reviewSessionRepository = new PrismaReviewSessionRepository();

	const analyzePullRequestUseCase = new AnalyzePullRequestUseCase(
		projectSettingsRepository,
		repoClientService,
		accountRepository,
		reviewSessionRepository,
		reviewIssueRepository,
		aiService
	);
	if (event === "pull_request") {
		const action = payload.action;
		const pr = payload.pull_request;
		const repo = payload.repository;

		if (!["opened", "synchronize", "reopened"].includes(action))
			return res.status(200).send({ ok: true });

		const data = await analyzePullRequestUseCase.execute({
			repoName: repo.name,
			providerUserId: repo.owner.id,
			branch: pr.head.ref,
			prNumber: pr.number,
			provider: ProviderType.GITHUB,
		});

		return res.status(200).send(data);
	}
}
