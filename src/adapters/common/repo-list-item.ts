import {
	CommonRepoDTO,
	RepoListItem,
} from "@/lib/repo-provider/types/common-types";

export function mapCommonRepoToRepoListItem(repo: CommonRepoDTO): RepoListItem {
	return {
		id: repo.id,
		name: repo.name,
		description: repo.description,
		isPrivate: repo.private,
		url: repo.html_url,
		language: repo.language,
		owner: repo.owner.login,
		nodeId: repo.nodeId,
		cloneUrl: repo.clone_url,
		defaultBranch: repo.default_branch,
	};
}
