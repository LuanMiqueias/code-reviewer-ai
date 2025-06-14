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

		await this.repoClientService.cloneRepo({
			repoName,
			providerUserName: account.providerUserName,
			token: account.accessToken,
			repoBranch: repoConnectionSettings.RepoConnection.defaultBranch,
		});

		const issues = await this.reviewIssueRepository.getAllByReviewSessionId(
			repoConnectionSettings.RepoConnection.id
		);

		console.log(await getRepoCodeChunks(LOCAL_REPO_PATH));
		// const existingIssues = await this.reviewIssueRepository.findMany({
		// 	where: {
		// 		reviewSessionId: repoConnectionSettings.RepoConnection.id,
		// 	},
		// });

		// const mockResponse = {
		// 	filename: "src/app.ts",
		// 	review: [
		// 		{
		// 			title: "Utilizar variáveis de ambiente para configuração do CORS",
		// 			body: "Atualmente, a configuração do CORS permite qualquer origem (`origin: '*'`). Isso é inseguro em um ambiente de produção, pois permite que qualquer site faça requisições para sua API. Recomenda-se definir as origens permitidas através de variáveis de ambiente, permitindo maior controle e segurança. Exemplo:\n\n```typescript\napp.register(cors, {\n  origin: env.ALLOWED_ORIGINS.split(','),\n})\n```\n\nCertifique-se de validar e tratar a ausência da variável `ALLOWED_ORIGINS` para evitar erros.\n\nImpacto: A configuração atual de CORS abre sua API para ataques como CSRF (Cross-Site Request Forgery).\n",
		// 		},
		// 		{
		// 			title: "Centralizar tratamento de erros para melhor manutenção",
		// 			body: "O tratamento de erros está implementado diretamente no `setErrorHandler`. Para uma aplicação DDD, seria interessante mover essa lógica para uma camada mais interna (por exemplo, um serviço de tratamento de erros) para promover a separação de responsabilidades e facilitar testes e manutenção.  Isso permite também a adição de logs e métricas mais facilmente.  Considere criar um `ErrorHandlerService` ou similar.\n\nImpacto: Dificulta a manutenção e testabilidade da aplicação.  Centralizar o tratamento de erros facilita a adição de novas funcionalidades como logging e monitoramento.",
		// 		},
		// 		{
		// 			title: "Melhorar tratamento de erros genéricos",
		// 			body: "O tratamento de erros genéricos retorna um status 500 com uma mensagem genérica.  Em um ambiente de produção, isso pode dificultar o diagnóstico de problemas. Considere adicionar mais informações ao erro, como um ID de erro único para rastreamento, ou utilizar uma ferramenta de logging para registrar os detalhes do erro.  Além disso, evite exibir informações sensíveis (stack traces) em ambientes de produção.\n\n```typescript\nif (env.NODE_ENV === 'dev') {\n  console.error(error);\n} else {\n  // Use a logging service here to log the error\n  // e.g., logger.error({ error, requestId: req.id });\n}\n\nreturn res.status(500).send({ message: 'Internal Server Error', errorId: req.id });\n```\n\nImpacto: Dificulta a identificação e resolução de problemas em produção.  A falta de informações detalhadas sobre o erro torna o debug mais complexo.",
		// 		},
		// 		{
		// 			title: "Validar a existência da variável de ambiente JWT_SECRET",
		// 			body: "O código assume que a variável de ambiente `JWT_SECRET` sempre estará definida. No entanto, é uma boa prática verificar se a variável está definida e, caso contrário, lançar um erro ou usar um valor padrão (apenas para desenvolvimento) e alertar o usuário. Isso evita que a aplicação falhe silenciosamente.\n\n```typescript\nif (!env.JWT_SECRET) {\n  throw new Error('JWT_SECRET environment variable is not defined.');\n}\n```\n\nImpacto: A ausência da variável `JWT_SECRET` causa falha na autenticação, podendo comprometer a segurança da aplicação.",
		// 		},
		// 		{
		// 			title:
		// 				"Usar importação nomeada para evitar namespaces desnecessários",
		// 			body: 'Em vez de `import fastify from "fastify";`, pode-se usar `import { FastifyInstance } from "fastify";`. Isso evita ter que referenciar fastify como namespace e deixa o código mais limpo.\n\nImpacto: Pequena melhoria na legibilidade do código.',
		// 		},
		// 		{
		// 			title:
		// 				"Considerar o uso de um esquema de validação para as opções do CORS",
		// 			body: "Embora o código configure o CORS, não há validação das opções fornecidas. Utilizar um esquema de validação, como Zod, para as opções do CORS pode ajudar a evitar erros de configuração e aumentar a robustez da aplicação.\n\nImpacto: A falta de validação das opções do CORS pode levar a comportamentos inesperados e vulnerabilidades.",
		// 		},
		// 		{
		// 			title: "Adicionar tratamento de erros para JWT",
		// 			body: "Atualmente, o código não possui um tratamento específico para erros relacionados ao JWT (expiração, token inválido, etc.). É importante adicionar um tratamento de erros para esses casos, retornando códigos de status apropriados (401 Unauthorized, 403 Forbidden) e mensagens de erro informativas. Fastify oferece hooks como `preValidation` e `onError` que podem ser usados para interceptar e tratar esses erros. Por exemplo:\n\n```typescript\napp.setErrorHandler((error, request, reply) => {\n  if (error.code === 'FST_JWT_NO_AUTHORIZATION_IN_HEADER' || error.code === 'FST_JWT_AUTHORIZATION_TOKEN_EXPIRED') {\n    return reply.status(401).send({ message: 'Unauthorized' });\n  }\n  // ... other error handling\n});\n```\n\nImpacto: A falta de tratamento de erros JWT pode levar a um comportamento inesperado e dificuldade de depuração de problemas de autenticação.",
		// 		},
		// 	],
		// };

		const chunks = await getRepoCodeChunks(LOCAL_REPO_PATH);
		// const reviews = mockResponse;

		const reviews: { title: string; body: string }[] = [];
		const reviewsRaw: string[] = [];

		for (const chunk of chunks) {
			// const embedding = await this.aiService.generateCodeChunkEmbedding({
			// 	filename: chunk.filename,
			// 	content: chunk.content,
			// });
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
			reviews.push(reviewParsed);
		}

		console.log("AQUI ----------------------");

		// await deleteTempDir(TEMP_DIR);
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
