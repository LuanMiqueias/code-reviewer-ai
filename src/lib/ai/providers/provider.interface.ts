import { ProjectSettings } from "@prisma/client";

export interface AIProvider {
	chatCompletion(messages: string): Promise<string>;
	analyzeCodeChunk(
		chunksToContext: { filename: string; content: string }[],
		chunk: {
			filename: string;
			content: string;
		},
		settings: ProjectSettings
	): Promise<string>;
	generateIssueEmbedding(issue: {
		title: string;
		body: string;
	}): Promise<number[]>;
	generateCodeChunkEmbedding(chunk: {
		filename: string;
		content: string;
	}): Promise<number[]>;
}
