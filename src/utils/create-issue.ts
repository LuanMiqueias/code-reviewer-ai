import { env } from "@/env";
import axios from "axios";
export async function createGitHubIssue(
	owner: string,
	repo: string,
	title: string,
	body: string
) {
	try {
		const response = await axios.post(
			`https://api.github.com/repos/LuanMiqueias/trade-vision-api/issues`,
			{
				title: title,
				body: body,
			},
			{
				headers: {
					Authorization: `Bearer ${env.GITHUB_API_KEY}`,
					Accept: "application/vnd.github+json",
					"User-Agent": "code-reviewer-ai",
				},
			}
		);
		return response; // dados da issue criada
	} catch (error) {
		console.log(error);
		return error;
	}
}
