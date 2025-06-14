import { Prisma, ProjectSettings, RepoConnection } from "@prisma/client";

export interface ProjectSettingsRepository {
	create(
		data: Prisma.ProjectSettingsCreateInput,
		repoConnectionId: string
	): Promise<ProjectSettings>;
	findById(id: string): Promise<ProjectSettings | null>;
	findByRepoConnectionId(
		repoConnectionId: string
	): Promise<ProjectSettings | null>;
	findByRepoName(repoName: string): Promise<
		| (ProjectSettings & {
				RepoConnection: RepoConnection;
		  })
		| null
	>;
}
