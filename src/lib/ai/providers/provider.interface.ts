export interface AIProvider {
	chatCompletion(messages: string): Promise<string>;
}
