import { GithubRepoDTO } from "@/infra/repo-provider/types/github-types";
import { RepoListItem } from "@/infra/repo-provider/types/github-types";

export function mapGithubRepoToRepoListItem(repo: GithubRepoDTO): RepoListItem {
	return {
		id: repo.id,
		name: repo.name,
		description: repo.description,
		isPrivate: repo.private,
		url: repo.html_url,
		language: repo.language,
		owner: repo.owner.login,
	};
}
