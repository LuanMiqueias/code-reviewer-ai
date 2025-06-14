import { env } from "@/env";
import { OpenAI } from "openai";
import { AIProvider } from "./provider.interface";

export class OpenAIProvider implements AIProvider {
	private client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

	async chatCompletion(data: any) {
		const res = await this.client.chat.completions.create({
			model: "gpt-4",
			messages: [
				{ role: "system", content: "Você é um analista financeiro." },
				{ role: "user", content: "Analise os seguintes dados:" },
				{ role: "user", content: JSON.stringify(data) },
			],
		});

		return JSON.parse(res.choices[0].message.content ?? "{}");
	}
	analyzeCodeChunk(data: any): Promise<string> {
		throw new Error("Method not implemented.");
	}
	generateIssueEmbedding(issue: { title: string; body: string }): Promise<any> {
		throw new Error("Method not implemented.");
	}
	generateCodeChunkEmbedding(chunk: {
		filename: string;
		content: string;
	}): Promise<number[]> {
		throw new Error("Method not implemented.");
	}
}
