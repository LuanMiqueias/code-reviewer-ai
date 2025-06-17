import fg from "fast-glob";
import { readFile } from "fs/promises";
import path from "path";

export async function getRepoCodeChunks(
	repoPath: string,
	maxChunkSize = 1000,
	entriesFilesToAnalyze: string[] = ["**/*.{ts,js,tsx,jsx}"],
	entriesFoldersToIgnore: string[] = ["node_modules", "dist", "build", "public"]
) {
	const entries = await fg(entriesFilesToAnalyze, {
		cwd: repoPath,
		ignore: entriesFoldersToIgnore,
	});

	const chunks: { id: string; filename: string; content: string }[] = [];

	for (const file of entries) {
		const fullPath = path.join(repoPath, file);
		const content = await readFile(fullPath, "utf-8");

		for (let i = 0; i < content.length; i += maxChunkSize) {
			const chunk = content.slice(i, i + maxChunkSize);
			const id = `${file}:${i}-${i + maxChunkSize}`;
			chunks.push({ id, filename: file, content: chunk });
		}
	}

	return chunks;
}

export async function convertFileToChunks(
	repoPath: string,
	filename: string,
	maxChunkSize = 1000
) {
	const fullPath = path.join(repoPath, filename);
	const content = await readFile(fullPath, "utf-8");

	const chunks: { id: string; filename: string; content: string }[] = [];

	for (let i = 0; i < content.length; i += maxChunkSize) {
		const chunk = content.slice(i, i + maxChunkSize);
		const id = `${filename}:${i}-${i + maxChunkSize}`;

		chunks.push({ id, filename, content: chunk });
	}

	return chunks;
}
