import { ProviderType } from "@prisma/client";
import { GithubProvider } from "./github.client";
import { BitbucketProvider } from "./bitbucket.client";
import { RepoProviderInterface } from "./repo-client.interface";

export class RepoClientService implements RepoProviderInterface {
	private provider: RepoProviderInterface;

	constructor(provider: ProviderType) {
		switch (provider) {
			case "GITHUB":
				this.provider = new GithubProvider();
				break;
			case "BITBUCKET":
				this.provider = new BitbucketProvider();
				break;
			default:
				throw new Error(`Unsupported provider: ${provider}`);
		}
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
	async commentOnIssue(data: {
		repoName: string;
		providerUserName: string;
		token: string;
		title: string;
		body: string;
	}) {
		return this.provider.commentOnIssue(data);
	}
	async getPullRequestDiff(data: {
		repoName: string;
		providerUserName: string;
		prNumber: number;
	}) {
		return this.provider.getPullRequestDiff(data);
	}
}
