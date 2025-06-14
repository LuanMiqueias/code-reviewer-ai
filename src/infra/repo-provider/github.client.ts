import axios, { AxiosError } from "axios";
import { RepoProviderInterface } from "./repo-client.interface";
import { GithubRepoDTO, GithubUserDTO } from "./types/github-types";
import { env } from "@/env";
import { GithubError } from "./errors/github-error";
import { PaginatedResponse } from "@/@types/paginated-response";

export class GithubProvider implements RepoProviderInterface {
	private readonly clientId = env.GITHUB_CLIENT_ID!;
	private readonly clientSecret = env.GITHUB_CLIENT_SECRET!;

	private axios = axios.create({
		baseURL: "https://api.github.com",
		headers: {
			Accept: "application/vnd.github+json",
		},
	});

	private async safeRequest<T>(fn: () => Promise<T>): Promise<T> {
		try {
			return await fn();
		} catch (error) {
			if (error instanceof AxiosError) {
				throw new GithubError(
					error.response?.data?.message ?? "GitHub error",
					error.response?.status,
					error.code
				);
			}
			throw new GithubError("Unexpected error while communicating with GitHub");
		}
	}
	async findRepoByName({
		repoName,
		providerUserName,
		token,
	}: {
		repoName: string;
		providerUserName: string;
		token: string;
	}): Promise<GithubRepoDTO> {
		const { data } = await this.safeRequest(() =>
			this.axios.get<GithubRepoDTO>(`/repos/${providerUserName}/${repoName}`, {
				headers: { Authorization: `Bearer ${token}` },
			})
		);

		return data;
	}
	async getRepos(
		token: string,
		page: number,
		perPage: number
	): Promise<PaginatedResponse<GithubRepoDTO>> {
		const { data } = await this.safeRequest(() =>
			this.axios.get<GithubRepoDTO[]>("/user/repos", {
				headers: { Authorization: `Bearer ${token}` },
				params: {
					page,
					per_page: 30,
				},
			})
		);

		return {
			data: data,
			page: page,
			perPage: perPage,
		};
	}

	async fetchUser(token: string): Promise<GithubUserDTO> {
		const { data } = await this.safeRequest(() =>
			this.axios.get<GithubUserDTO>("/user", {
				headers: { Authorization: `Bearer ${token}` },
			})
		);
		console.log("data", data);
		return data;
	}

	async exchangeCodeForToken(code: string): Promise<{ accessToken: string }> {
		try {
			const response = await axios.post(
				"https://github.com/login/oauth/access_token",
				{
					client_id: this.clientId,
					client_secret: this.clientSecret,
					code,
				},
				{ headers: { Accept: "application/json" } }
			);

			return { accessToken: response.data.access_token };
		} catch (error) {
			if (error instanceof AxiosError) {
				throw new GithubError(
					error.response?.data?.message ?? "GitHub error",
					error.response?.status,
					error.code
				);
			}
			throw error instanceof GithubError
				? error
				: new GithubError(
						"An unexpected error occurred while exchanging code for token"
				  );
		}
	}
}
