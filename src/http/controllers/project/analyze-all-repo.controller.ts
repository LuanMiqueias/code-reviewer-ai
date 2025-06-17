import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

// Repositories
import { PrismaUserRepository } from "../../../repositories/prisma/prisma-user-repository";

// Use Cases
import { GetAllExternalRepositoriesUseCase } from "@/use-cases/project/get-all-external-repositories";
import { ProviderType } from "@prisma/client";
import { RepoClientService } from "@/lib/repo-provider/repo-client.service";
import { PrismaAccountRepository } from "@/repositories/prisma/prisma-account-repository";
import { GithubError } from "@/lib/repo-provider/errors/github-error";
import { CreateRepoConnectionUseCase } from "@/use-cases/project/create-repo-connection";
import { PrismaRepoConnectionRepository } from "@/repositories/prisma/prisma-repo-connection-repository";
import { AnalyzeRepoUseCase } from "@/use-cases/project/analyze-repo";
import { PrismaProjectSettingsRepository } from "@/repositories/prisma/prisma-project-settings-repository";
import { AIService } from "@/lib/ai/ai.service";
import { PrismaReviewSessionRepository } from "@/repositories/prisma/prisma-review-session-repository";
import { PrismaReviewIssueRepository } from "@/repositories/prisma/prisma-review-issue-repository";

export const analyzeRepoController = async (
	req: FastifyRequest,
	res: FastifyReply
) => {
	const CloneExternalRepoQuerySchema = z.object({
		repoName: z.string(),
	});

	const { repoName } = CloneExternalRepoQuerySchema.parse(req.params);

	const { provider, providerUserId } = req.user.sign;

	const projectSettingsRepository = new PrismaProjectSettingsRepository();
	const accountRepository = new PrismaAccountRepository();
	const repoClientService = new RepoClientService(provider);
	const reviewSessionRepository = new PrismaReviewSessionRepository();
	const reviewIssueRepository = new PrismaReviewIssueRepository();
	const aiService = new AIService("gemini");

	const cloneExternalRepoUseCase = new AnalyzeRepoUseCase(
		projectSettingsRepository,
		repoClientService,
		accountRepository,
		reviewSessionRepository,
		reviewIssueRepository,
		aiService
	);

	const data = await cloneExternalRepoUseCase.execute({
		providerUserId,
		provider,
		repoName,
	});

	return res.status(200).send(data);
};
