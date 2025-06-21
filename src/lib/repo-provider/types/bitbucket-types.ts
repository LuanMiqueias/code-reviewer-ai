export interface BitbucketUserDTO {
	uuid: string;
	display_name: string;
	username: string;
	account_id: string;
	links: {
		avatar: {
			href: string;
		};
	};
	email?: string;
}

export interface BitbucketEmailDTO {
	email: string;
	is_primary: boolean;
	is_confirmed: boolean;
}

export interface BitbucketRepoDTO {
	uuid: string;
	name: string;
	full_name: string;
	owner: {
		username: string;
		display_name: string;
		uuid: string;
		links: {
			avatar: {
				href: string;
			};
		};
	};
	description: string | null;
	links: {
		clone: Array<{
			name: string;
			href: string;
		}>;
		html: {
			href: string;
		};
	};
	mainbranch: {
		name: string;
	};
	is_private: boolean;
	language: string | null;
}

export interface BitbucketPullRequestFileDTO {
	type: string;
	old: {
		path: string;
		type: string;
		commit: {
			hash: string;
		};
	} | null;
	new: {
		path: string;
		type: string;
		commit: {
			hash: string;
		};
	} | null;
	status: "added" | "removed" | "modified" | "renamed";
	lines_added: number;
	lines_removed: number;
	diff?: string;
}

export interface BitbucketPullRequestDTO {
	id: number;
	title: string;
	description: string;
	state: "OPEN" | "MERGED" | "DECLINED";
	source: {
		branch: {
			name: string;
		};
		commit: {
			hash: string;
		};
	};
	destination: {
		branch: {
			name: string;
		};
		commit: {
			hash: string;
		};
	};
	links: {
		html: {
			href: string;
		};
	};
}
