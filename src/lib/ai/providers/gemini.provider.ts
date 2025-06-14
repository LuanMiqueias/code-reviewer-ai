import { env } from "@/env";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ProjectSettings } from "@prisma/client";
import { AIProvider } from "./provider.interface";

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
		const text = `${chunk.filename}\n${chunk.content}`;
		const embedding = await this.modelEmbedding.embedContent(text);
		return embedding.embedding.values;
	}

	async analyzeCodeChunk(
		chunk: { filename: string; content: string },
		projectSettings: ProjectSettings
	) {
		const prompt = `
Você é um revisor de código sênior especialista em boas práticas, segurança, performance e arquitetura.

Analise o código do arquivo "${chunk.filename}" com base nas configurações abaixo do projeto:

- Linguagem: ${projectSettings.language}
- Tipo de Projeto: ${projectSettings.projectType}
- Arquitetura: ${projectSettings.architecture}
- Estilo de Código: ${projectSettings.codingStyle}

Identifique problemas, vulnerabilidades e oportunidades de melhoria no código com base nessas características.

Crie uma issue com as seguintes propriedades e retorne em um objeto JSON válido:

  {
    "title": "Título curto e claro da issue",
    "body": "Descrição breve da issue, incluindo impacto, sugestão de correção e exemplo de código, se possível."
  }

Se não houver issues, retorne um objeto vazio: {}

Crie as issues em português brasileiro.

Aqui está o código a ser analisado:
\`\`\`
${chunk.content}
\`\`\`
`;

		const result = await this.model.generateContent(prompt);

		const response = result.response;
		return response.text();
	}
}
