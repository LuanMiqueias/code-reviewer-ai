import { ProviderType } from "@prisma/client";
import { GithubProvider } from "./github.client";
import { RepoProviderInterface } from "./repo-client.interface";

export class RepoClientService implements RepoProviderInterface {
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

	async findRepoByName(data: {
		repoName: string;
		providerUserName: string;
		token: string;
	}) {
		return this.provider.findRepoByName(data);
	}

	async cloneRepo(data: {
		repoName: string;
		providerUserName: string;
		token: string;
		repoBranch: string;
	}) {
		return this.provider.cloneRepo(data);
	}

	async getPullRequest(data: {
		repoName: string;
		providerUserName: string;
		token: string;
		prNumber: number;
	}) {
		return this.provider.getPullRequest(data);
	}
	async commentOnPullRequest(data: {
		repoName: string;
		providerUserName: string;
		token: string;
		prNumber: number;
		comment: string;
	}) {
		return this.provider.commentOnPullRequest(data);
	}
}
