// Tipos comuns para todos os provedores de repositório
export interface CommonUserDTO {
	id: string | number;
	login: string;
	name: string;
	avatar_url: string;
	email: string | null;
}

export interface CommonRepoDTO {
	id: string | number;
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
	nodeId: string;
}

export interface CommonPullRequestFileDTO {
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

// Tipo para lista de repositórios (já existia)
export interface RepoListItem {
	id: string | number;
	name: string;
	description: string | null;
	isPrivate: boolean;
	url: string;
	language: string | null;
	owner: string;
	nodeId: string;
	cloneUrl: string;
	defaultBranch: string;
}
