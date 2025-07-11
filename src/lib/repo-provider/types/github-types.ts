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

export interface GithubPullRequestFileDTO {
	sha: string;
	filename: string;
	status: "added" | "removed" | "modified" | "renamed" | "copied" | "changed";
	additions: number;
	deletions: number;
	changes: number;
	blob_url: string;
	raw_url: string;
	contents_url: string;
	patch?: string;
	previous_filename?: string;
}
