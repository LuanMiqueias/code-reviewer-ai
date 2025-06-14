import axios, { AxiosError } from "axios";
import { RepoProviderInterface } from "./repo-client.interface";
import {
	GithubPullRequestFileDTO,
	GithubRepoDTO,
	GithubUserDTO,
} from "./types/github-types";
import { env } from "@/env";
import { GithubError } from "./errors/github-error";
import { PaginatedResponse } from "@/@types/paginated-response";
import { exec } from "child_process";
import path from "path";
import fs from "fs";

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
					error.response?.status ?? 500
				);
			}
			throw new GithubError(
				"Unexpected error while communicating with GitHub",
				500
			);
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
					error.response?.status ?? 500
				);
			}
			throw error instanceof GithubError
				? error
				: new GithubError(
						"An unexpected error occurred while exchanging code for token",
						500
				  );
		}
	}

	async cloneRepo(data: {
		repoName: string;
		providerUserName: string;
		token: string;
		repoBranch: string;
	}) {
		const TEMP_DIR = path.resolve("./temp");
		const LOCAL_REPO_PATH = path.join(TEMP_DIR, data?.repoName);

		if (this.isRepoCloned(LOCAL_REPO_PATH)) {
			console.log("Repository already cloned!");
			return;
		}

		const remote = `https://${data?.token}@github.com/${data?.providerUserName}/${data?.repoName}.git`;

		exec(
			`git clone -b ${data?.repoBranch} ${remote} ${LOCAL_REPO_PATH}`,
			(err, stdout, stderr) => {
				if (err) {
					console.error("Erro ao clonar:", stderr);
					return;
				}

				console.log("✅ Repositório clonado!");
			}
		);
	}

	private isRepoCloned(localRepoPath: string): boolean {
		return fs.existsSync(localRepoPath);
	}

	async getPullRequest(data: {
		repoName: string;
		providerUserName: string;
		token: string;
		prNumber: number;
	}): Promise<GithubPullRequestFileDTO[]> {
		const { data: pullRequest } = await this.safeRequest(() =>
			this.axios.get<GithubPullRequestFileDTO[]>(
				`/repos/${data?.providerUserName}/${data?.repoName}/pulls/${data?.prNumber}/files`,
				{
					headers: { Authorization: `Bearer ${data?.token}` },
				}
			)
		);

		return pullRequest;
	}
	async commentOnPullRequest(data: {
		repoName: string;
		providerUserName: string;
		token: string;
		prNumber: number;
		comment: string;
	}) {
		const { data: comment } = await this.safeRequest(() =>
			this.axios.post(
				`/repos/${data?.providerUserName}/${data?.repoName}/issues/${data?.prNumber}/comments`,
				{ body: data?.comment },
				{ headers: { Authorization: `Bearer ${data?.token}` } }
			)
		);

		return comment;
	}
}
