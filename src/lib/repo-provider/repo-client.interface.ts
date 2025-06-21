import { PaginatedResponse } from "@/@types/paginated-response";
import {
	CommonUserDTO,
	CommonRepoDTO,
	CommonPullRequestFileDTO,
} from "./types/common-types";

export interface RepoProviderInterface {
	getRepos(
		token: string,
		page: number,
		perPage: number
	): Promise<PaginatedResponse<CommonRepoDTO>>;
	fetchUser(token: string): Promise<CommonUserDTO>;
	exchangeCodeForToken(code: string): Promise<{ accessToken: string }>;
	findRepoByName(data: {
		repoName: string;
		providerUserName: string;
		token: string;
	}): Promise<CommonRepoDTO>;
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
	}): Promise<CommonPullRequestFileDTO[]>;
	commentOnPullRequest(data: {
		repoName: string;
		providerUserName: string;
		token: string;
		prNumber: number;
		comment: string;
	}): Promise<void>;
	commentOnIssue(data: {
		repoName: string;
		providerUserName: string;
		token: string;
		title: string;
		body: string;
	}): Promise<void>;
	getPullRequestDiff(data: {
		repoName: string;
		providerUserName: string;
		prNumber: number;
	}): Promise<string>;
}
