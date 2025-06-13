import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

// Repositories
import { PrismaUserRepository } from "@/repositories/prisma/prisma-user-repository";

// Use Cases
import { InvalidCreditialError } from "@/use-cases/errors/invalid-credentials-error";
import axios from "axios";
import { env } from "@/env";
import { main } from "@/utils/clone";
import { AIService } from "@/lib/ai/ai.service";
import { createGitHubIssue } from "@/utils/create-issue";

const GITHUB_TOKEN = env.GITHUB_API_KEY;
const USERNAME = "luanMiqueias";

export const getGithubUser = async (req: FastifyRequest, res: FastifyReply) => {
	try {
		const GeminiService = new AIService("gemini");
		const chunks = await main();
		const reviews = [];
		for (const chunk of chunks) {
			console.log(chunk);

			const review = await GeminiService.analyzeCodeChunk(chunks[0]);
			reviews.push({
				filename: chunk.filename,
				review: parseIssuesFromAIResponse(review),
			});
			parseIssuesFromAIResponse(review).forEach((issue) => {
				createGitHubIssue(
					"luanMiqueias",
					"trade-vision-api",
					chunk.filename + " - " + issue.title,
					issue.body
				);
			});
		}

		return res.status(200).send({ issues: reviews });
	} catch (err) {
		if (err instanceof InvalidCreditialError) {
			return res.status(404).send({ message: err.message });
		}
		return res.status(500).send(err); //TODO: fix later
	}
};

function parseIssuesFromAIResponse(
	raw: string
): { title: string; body: string }[] {
	// Remove blocos de markdown ```json e ```
	const cleaned = raw.replace(/^```json\s*/i, "").replace(/\s*```$/, "");

	try {
		return JSON.parse(cleaned);
	} catch (err) {
		console.error("Erro ao fazer parse do JSON da IA:", err);
		return [];
	}
}
