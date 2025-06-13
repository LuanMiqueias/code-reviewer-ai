import axios from "axios";
import { RepoProviderInterface } from "./repo-client.interface";
import { GithubUserDTO } from "./types/github-types";
import { env } from "@/env";

export class GithubProvider implements RepoProviderInterface {
	private readonly clientId = env.GITHUB_CLIENT_ID!;
	private readonly clientSecret = env.GITHUB_CLIENT_SECRET!;

	private axios = axios.create({
		baseURL: "https://api.github.com",
		headers: {
			Accept: "application/vnd.github+json",
		},
	});

	async getRepos() {
		return [];
	}

	async fetchUser(token: string): Promise<GithubUserDTO> {
		const response = await this.axios.get<GithubUserDTO>("/user", {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		console.log("response", response.data);
		return response.data;
	}
	async exchangeCodeForToken(code: string): Promise<{ accessToken: string }> {
		const response = await axios.post(
			"https://github.com/login/oauth/access_token",
			{
				client_id: this.clientId,
				client_secret: this.clientSecret,
				code,
			},
			{ headers: { Accept: "application/json" } }
		);

		console.log("response", response.data);

		return { accessToken: response.data.access_token };
	}
}
