import fg from "fast-glob";
import { readFile } from "fs/promises";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
const GITHUB_TOKEN = process.env.GITHUB_PAT!;
const GITHUB_USER = "luanMiqueias"; // <- seu usuário do GitHub
const REPO_NAME = "trade-vision-api"; // <- nome do repositório
const REPO_BRANCH = "main"; // ou 'master'
const TEMP_DIR = path.resolve("./temp"); // pasta temporária para clone
const LOCAL_REPO_PATH = path.join(TEMP_DIR, REPO_NAME);

async function cloneRepo() {
	const remote = `https://${GITHUB_TOKEN}@github.com/${GITHUB_USER}/${REPO_NAME}.git`;

	exec(
		`git clone -b ${REPO_BRANCH} ${remote} ${LOCAL_REPO_PATH}`,
		(err, stdout, stderr) => {
			if (err) {
				console.error("Erro ao clonar:", stderr);
				return;
			}

			console.log("✅ Repositório clonado!");
		}
	);
}

async function getCodeChunks(repoPath: string, maxChunkSize = 1000) {
	const entries = await fg(["**/*.{ts,js,tsx,jsx}"], {
		cwd: repoPath,
		ignore: ["node_modules", "dist", "build"],
	});

	const chunks: { filename: string; content: string }[] = [];

	for (const file of entries) {
		const fullPath = path.join(repoPath, file);
		const content = await readFile(fullPath, "utf-8");

		for (let i = 0; i < content.length; i += maxChunkSize) {
			const chunk = content.slice(i, i + maxChunkSize);
			chunks.push({ filename: file, content: chunk });
		}
	}

	return chunks;
}

export async function main() {
	await cloneRepo();
	const chunks = await getCodeChunks(LOCAL_REPO_PATH);

	return chunks;
}
