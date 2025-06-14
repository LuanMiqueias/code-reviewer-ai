export interface GithubUserDTO {
	id: number;
	login: string;
	name: string;
	avatar_url: string;
	email: string | null;
}

export interface GithubRepoDTO {
	id: number;
	name: string;
	fullName: string;
	owner: {
		login: string;
		avatarUrl: string;
	};
	description: string | null;
	clone_url: string;
	default_branch: string;
	private: boolean;
	language: string | null;
	html_url: string;
	nodeId?: string;
}

export type RepoListItem = {
	id: number;
	name: string;
	description: string | null;
	isPrivate: boolean;
	url: string;
	language: string | null;
	owner: string;
	nodeId: string;
	cloneUrl: string;
	defaultBranch: string;
};
