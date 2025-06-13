import { ProviderType } from "@prisma/client";
import { GithubProvider } from "./github.client";
import { RepoProviderInterface } from "./repo-client.interface";

export class RepoClientService {
	private provider: RepoProviderInterface;

	constructor(provider: ProviderType) {
		this.provider = new GithubProvider();
	}

	async getRepos(token: string, page: number = 1, perPage: number = 30) {
		return this.provider.getRepos(token, page, perPage);
	}

	async fetchUser(token: string) {
		console.log("token", token);
		return this.provider.fetchUser(token);
	}

	async exchangeCodeForToken(code: string) {
		return this.provider.exchangeCodeForToken(code);
	}
}
