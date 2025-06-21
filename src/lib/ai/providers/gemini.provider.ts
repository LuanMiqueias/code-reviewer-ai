import { env } from "@/env";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ProjectSettings } from "@prisma/client";
import { AIProvider } from "./provider.interface";
import { AxiosError } from "axios";
import { GithubError } from "@/lib/repo-provider/errors/github-error";
import { GeminiError } from "./errors/gemini-error";

export class GeminiProvider implements AIProvider {
	private model;
	private modelEmbedding;

	constructor() {
		const ai = new GoogleGenerativeAI(env.GEMINI_API_KEY || "");

		this.model = ai.getGenerativeModel({
			model: "gemini-2.0-flash-001",
		});
		this.modelEmbedding = ai.getGenerativeModel({ model: "embedding-001" });
	}

	private async safeRequest<T>(fn: () => Promise<T>): Promise<T> {
		try {
			return await fn();
		} catch (error) {
			if (error instanceof AxiosError) {
				throw new GeminiError(
					error.response?.data?.message ?? "Gemini error",
					error.response?.status ?? 500
				);
			}
			throw new GeminiError(
				"Unexpected error while communicating with Gemini",
				500
			);
		}
	}

	async chatCompletion(data: any) {
		const result = await this.model.generateContent([
			"Você é um analista financeiro. Analise os seguintes dados:",
			JSON.stringify(data),
		]);

		const text = await result.response.text();
		const match = text.match(/```json\n([\s\S]+?)```/)?.[1] || text;
		return JSON.parse(match);
	}
	async generateIssueEmbedding(issue: { title: string; body: string }) {
		const text = `${issue.title}\n${issue.body}`;
		const embedding = await this.modelEmbedding.embedContent(text);
		return embedding.embedding.values;
	}
	async generateCodeChunkEmbedding(chunk: {
		filename: string;
		content: string;
	}) {
		const response = await this.safeRequest(async () => {
			const text = `${chunk.filename}\n${chunk.content}`;
			const embedding = await this.modelEmbedding.embedContent(text);

			return embedding.embedding.values;
		});
		return response;
	}

	async analyzeCodeChunk(
		chunksToContext: { filename: string; content: string }[],
		chunk: { filename: string; content: string },
		projectSettings: ProjectSettings
	) {
		const prompt = `
Você é um revisor de código sênior especialista em boas práticas, segurança, performance e arquitetura.

Analise o trecho de código do arquivo, revise somente o trecho de código:"${
			chunk.filename
		}" com base nas configurações abaixo do projeto:

- Linguagem: ${projectSettings.language}
- Tipo de Projeto: ${projectSettings.projectType}
- Arquitetura: ${projectSettings.architecture}
- Estilo de Código: ${projectSettings.codingStyle}
- Descrição do projeto: ${projectSettings.description}

Identifique problemas de nivel, vulnerabilidades e oportunidades de melhoria no código com base nessas características.


Crie um comentário para o pull request com as seguintes propriedades e retorne em um objeto JSON válido:

  {
    "title": "Título curto e claro da issue e inclua o o path do arquivo",
    "body": "Em markdown, descrição breve da issue, incluindo impacto, sugestão de correção. com no maximo 1500 caracteres"
  }

Se não houver issues, retorne um objeto vazio: {}

Crie as issues em português brasileiro.

Revise somente o trecho de código:
\`\`\`
${chunk.content}
\`\`\`

Contexto sobre o projeto (não revise o contexto):
\`\`\`
${chunksToContext
	.map((chunk) => `${chunk.filename}\n${chunk.content}`)
	.join("\n")}
\`\`\`
`;

		const tokens = await this.model.countTokens(prompt);
		console.log("Tokens ----------------------", tokens.totalTokens);
		const result = await this.model.generateContent(prompt);

		const response = result.response;
		return response.text();
	}
}
