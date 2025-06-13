export class GithubError extends Error {
	constructor(
		message: string,
		public statusCode?: number,
		public code?: string
	) {
		super(message);
		this.name = "GithubError";
	}
}
