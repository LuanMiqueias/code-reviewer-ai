import { Prisma, ProjectSettings } from "@prisma/client";

export interface ProjectSettingsRepository {
	create(
		data: Prisma.ProjectSettingsCreateInput,
		repoConnectionId: string
	): Promise<ProjectSettings>;
	findById(id: string): Promise<ProjectSettings | null>;
}
