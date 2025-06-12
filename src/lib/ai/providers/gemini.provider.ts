import { env } from "@/env";
import { AIProvider } from "@/lib/ai/providers/provider.interface";
import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiProvider implements AIProvider {
	private model;

	constructor() {
		const ai = new GoogleGenerativeAI(env.GEMINI_API_KEY || "");
		this.model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
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
}
