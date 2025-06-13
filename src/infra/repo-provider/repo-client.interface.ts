import { User } from "@prisma/client";
import { GithubUserDTO } from "./types/github-types";

export interface RepoProviderInterface {
	getRepos(): Promise<any>;
	fetchUser(code: string): Promise<GithubUserDTO>;
	exchangeCodeForToken(code: string): Promise<{ accessToken: string }>;
}
