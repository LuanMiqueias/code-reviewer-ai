import { User } from "@prisma/client";
import {
	GithubPullRequestFileDTO,
	GithubRepoDTO,
	GithubUserDTO,
} from "./types/github-types";
import { PaginatedResponse } from "@/@types/paginated-response";

export interface RepoProviderInterface {
	getRepos(
		token: string,
		page: number,
		perPage: number
	): Promise<PaginatedResponse<any>>;
	fetchUser(token: string): Promise<GithubUserDTO>;
	exchangeCodeForToken(code: string): Promise<{ accessToken: string }>;
	findRepoByName(data: {
		repoName: string;
		providerUserName: string;
		token: string;
	}): Promise<GithubRepoDTO>;
	cloneRepo(data: {
		repoName: string;
		providerUserName: string;
		token: string;
		repoBranch: string;
	}): Promise<void>;
	getPullRequest(data: {
		repoName: string;
		providerUserName: string;
		token: string;
		prNumber: number;
	}): Promise<GithubPullRequestFileDTO[]>;
	commentOnPullRequest(data: {
		repoName: string;
		providerUserName: string;
		token: string;
		prNumber: number;
		comment: string;
	}): Promise<void>;
}
