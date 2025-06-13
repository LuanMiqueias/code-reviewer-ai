import { env } from "@/env";
import { AIProvider } from "@/lib/ai/providers/provider.interface";
import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiProvider implements AIProvider {
	private model;

	constructor() {
		const ai = new GoogleGenerativeAI(env.GEMINI_API_KEY || "");
		this.model = ai.getGenerativeModel({ model: "gemini-2.0-flash-001" });
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
	async analyzeCodeChunk(chunk: { filename: string; content: string }) {
		const prompt = `
		Você é um revisor de código sênior especialista em boas práticas, segurança, performance e arquitetura.
		
		Analise o código do arquivo "${chunk.filename}" e identifique problemas, vulnerabilidades e melhorias.
		
		Para cada ponto encontrado, crie uma issue com as seguintes propriedades, e retorne todas as issues em um array JSON válido:
		
		[
			{
				"title": "Título curto e claro da issue",
				"body": "Descrição detalhada da issue, incluindo impacto, sugestão de correção e exemplos de código, se possível."
			}
		]
		
		Se não houver issues, retorne um array vazio: []
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
