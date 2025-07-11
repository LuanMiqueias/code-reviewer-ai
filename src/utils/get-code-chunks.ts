import fg from "fast-glob";
import { readFile } from "fs/promises";
import path from "path";

export async function getCodeChunks(projectPath: string, maxChunkSize = 1000) {
	const entries = await fg(["**/*.{ts,js,tsx,jsx}"], {
		cwd: projectPath,
		dot: false,
		ignore: ["node_modules", "dist", "build"],
	});

	const chunks: { filename: string; content: string }[] = [];

	for (const file of entries) {
		const fullPath = path.join(projectPath, file);
		const content = await readFile(fullPath, "utf-8");

		// Quebrar o conteúdo em pedaços menores (ex: 1000 caracteres)
		for (let i = 0; i < content.length; i += maxChunkSize) {
			const chunk = content.slice(i, i + maxChunkSize);
			chunks.push({ filename: file, content: chunk });
		}
	}

	return chunks;
}
