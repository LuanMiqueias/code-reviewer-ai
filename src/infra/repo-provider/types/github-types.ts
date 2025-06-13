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
	full_name: string;
	html_url: string;
	description: string;
	language: string | null;
	private: boolean;
	owner: {
		login: string;
	};
}

export type RepoListItem = {
	id: number;
	name: string;
	description: string | null;
	isPrivate: boolean;
	url: string;
	language: string | null;
	owner: string;
};
