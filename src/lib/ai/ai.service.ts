import { ProjectSettings } from "@prisma/client";
import { GeminiProvider } from "./providers/gemini.provider";
import { OpenAIProvider } from "./providers/openai.provider";
import { AIProvider } from "./providers/provider.interface";

type AIModel = "openai" | "gemini";

export class AIService {
	private provider: AIProvider;

	constructor(model: AIModel) {
		if (model === "gemini") this.provider = new GeminiProvider();
		else this.provider = new OpenAIProvider();
	}

	chatCompletion(data: any) {
		return this.provider.chatCompletion(data);
	}
	analyzeCodeChunk(
		chunk: { filename: string; content: string },
		settings: ProjectSettings
	) {
		return this.provider.analyzeCodeChunk(chunk, settings);
	}
	generateIssueEmbedding(issue: { title: string; body: string }) {
		return this.provider.generateIssueEmbedding(issue);
	}
	generateCodeChunkEmbedding(chunk: { filename: string; content: string }) {
		return this.provider.generateCodeChunkEmbedding(chunk);
	}
}
