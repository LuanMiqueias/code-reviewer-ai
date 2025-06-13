export interface AIProvider {
	chatCompletion(messages: string): Promise<string>;
	analyzeCodeChunk(chunk: {
		filename: string;
		content: string;
	}): Promise<string>;
}
