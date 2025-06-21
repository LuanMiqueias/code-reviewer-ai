import { AIService } from "@/lib/ai/ai.service";
import { PrismaAccountRepository } from "@/repositories/prisma/prisma-account-repository";
import { PrismaProjectSettingsRepository } from "@/repositories/prisma/prisma-project-settings-repository";
import { PrismaReviewSessionRepository } from "@/repositories/prisma/prisma-review-session-repository";
import { PrismaReviewIssueRepository } from "@/repositories/prisma/prisma-review-issue-repository";
import { RepoClientService } from "@/lib/repo-provider/repo-client.service";
import { FastifyRequest, FastifyReply } from "fastify";
import { ProviderType } from "@prisma/client";
import { AnalyzePullRequestUseCase } from "@/use-cases/project/analyze-pull-request";

export async function bitbucketWebhookController(
	req: FastifyRequest,
	res: FastifyReply
) {
	const eventPayload = req.body as {
		repository: {
			name: string;
			workspace: {
				name: string;
			};
		};
		pullrequest: {
			comment_count: number;
			task_count: number;
			type: string;
			id: number;
			title: string;
			description: string;
			source: {
				branch: {
					name: string;
				};
			};
			destination: {
				branch: {
					name: string;
				};
			};
		};
	};
	const KEY_TRIGGER_IN_EVENT = "#reviewAI";

	const projectSettingsRepository = new PrismaProjectSettingsRepository();
	const accountRepository = new PrismaAccountRepository();
	const repoClientService = new RepoClientService("BITBUCKET");
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
	// console.log("event", eventPayload?.pullrequest?.source);
	// console.log("event", eventPayload?.pullrequest?.destination);
	const verifyPullRequest = eventPayload.pullrequest.type === "pullrequest";
	if (!verifyPullRequest) return res.status(200).send({ ok: true });

	if (!eventPayload?.pullrequest?.description?.includes(KEY_TRIGGER_IN_EVENT))
		return res.status(200).send({ ok: true });

	// if (eventPayload.eventKey === "pullrequest:created") {
	// const action = payload.action;
	// const pr = payload.pull_request;
	// const repo = payload.repository;
	// if (!["opened", "synchronize", "reopened"].includes(action))
	// 	return res.status(200).send({ ok: true });
	console.log({
		repoName: eventPayload?.repository?.name,
		providerUserId: eventPayload?.repository?.workspace?.name,
		branch: eventPayload?.pullrequest?.source?.branch?.name,
		prNumber: eventPayload?.pullrequest?.id,
		provider: ProviderType.BITBUCKET,
	});

	const data = await analyzePullRequestUseCase.execute({
		repoName: eventPayload?.repository?.name,
		providerUserId: eventPayload?.repository?.workspace?.name,
		branch: eventPayload?.pullrequest?.source?.branch?.name,
		prNumber: eventPayload?.pullrequest?.id,
		provider: ProviderType.BITBUCKET,
	});

	return res.status(200).send({ ok: true });
	// }
}
