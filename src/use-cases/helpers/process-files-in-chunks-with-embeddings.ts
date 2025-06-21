import { AIService } from "@/lib/ai/ai.service";
import { GithubPullRequestFileDTO } from "@/lib/repo-provider/types/github-types";
import {
	convertFileToChunks,
	getRepoCodeChunks,
} from "@/utils/get-local-repo-code-chunks";
import micromatch from "micromatch";
import { ErrorProcessingFilesInChunksWithEmbeddings } from "../errors/error";

export const processFilesInChunksWithEmbeddings = async ({
	LOCAL_REPO_PATH,
	files,
	entriesFilesToAnalyze,
	generateCodeChunkEmbedding,
}: {
	LOCAL_REPO_PATH: string;
	files: GithubPullRequestFileDTO[];
	generateCodeChunkEmbedding: (data: {
		filename: string;
		content: string;
	}) => Promise<number[]>;
	entriesFilesToAnalyze: string[];
}) => {
	const bigChunks = await getBigChunks(
		LOCAL_REPO_PATH,
		generateCodeChunkEmbedding
	);

	const smallChunks = await getSmallChunks({
		LOCAL_REPO_PATH,
		generateCodeChunkEmbedding,
		entriesFilesToAnalyze: entriesFilesToAnalyze,
		files,
	});
	console.log("smallChunks", smallChunks.length);
	return {
		bigChunks: bigChunks,
		smallChunks: smallChunks,
	};
};

const getBigChunks = async (
	LOCAL_REPO_PATH: string,
	generateCodeChunkEmbedding: any
) => {
	const bigChunks = await getRepoCodeChunks(LOCAL_REPO_PATH, 20000);

	const bigChunksWithEmbedding = await Promise.all(
		bigChunks.map(async (chunk) => {
			const embedding = await generateCodeChunkEmbedding({
				filename: chunk.filename,
				content: chunk.content,
			});
			return {
				...chunk,
				embedding,
			};
		})
	);

	return bigChunksWithEmbedding;
};

const getSmallChunks = async ({
	LOCAL_REPO_PATH,
	generateCodeChunkEmbedding,
	entriesFilesToAnalyze,
	files,
}: {
	LOCAL_REPO_PATH: string;
	generateCodeChunkEmbedding: any;
	entriesFilesToAnalyze: string[];
	files: GithubPullRequestFileDTO[];
}) => {
	const smallChunksWithEmbedding: {
		embedding: number[];
		id: string;
		filename: string;
		content: string;
	}[] = [];

	for (const file of files) {
		if (
			entriesFilesToAnalyze.length > 0 &&
			!micromatch.isMatch(file.filename, entriesFilesToAnalyze)
		) {
			continue;
		}
		const chunks = await convertFileToChunks(
			LOCAL_REPO_PATH,
			file.filename,
			5000
		);

		const chunksWithEmbedding = await Promise.all(
			chunks.map(async (chunk) => {
				try {
					const embedding = await generateCodeChunkEmbedding({
						filename: chunk.filename,
						content: chunk.content,
					});
					return {
						...chunk,
						embedding,
					};
				} catch (error) {
					throw new ErrorProcessingFilesInChunksWithEmbeddings(
						"Error generating embedding for small chunk"
					);
				}
			})
		);

		smallChunksWithEmbedding.push(...chunksWithEmbedding);
	}

	return smallChunksWithEmbedding;
};
