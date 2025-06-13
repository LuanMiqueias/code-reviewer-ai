import { ProviderType } from "@prisma/client";
import { GithubProvider } from "./github.client";
import { RepoProviderInterface } from "./repo-client.interface";

export class RepoClientService {
	private provider: RepoProviderInterface;

	constructor(provider: ProviderType, token: string) {
		this.provider = new GithubProvider(token);
	}

	async getRepos() {
		return this.provider.getRepos();
	}

	async fetchUser(token: string) {
		console.log("token", token);
		return this.provider.fetchUser(token);
	}

	async exchangeCodeForToken(code: string) {
		return this.provider.exchangeCodeForToken(code);
	}
}
