import { User } from "@prisma/client";
import { GithubRepoDTO, GithubUserDTO } from "./types/github-types";
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
}
