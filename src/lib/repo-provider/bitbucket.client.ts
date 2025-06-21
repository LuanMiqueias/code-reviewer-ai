import axios, { AxiosError } from "axios";
import { RepoProviderInterface } from "./repo-client.interface";
import {
	BitbucketPullRequestFileDTO,
	BitbucketRepoDTO,
	BitbucketUserDTO,
} from "./types/bitbucket-types";
import {
	CommonUserDTO,
	CommonRepoDTO,
	CommonPullRequestFileDTO,
} from "./types/common-types";
import { env } from "@/env";
import { BitbucketError } from "./errors/bitbucket-error";
import { PaginatedResponse } from "@/@types/paginated-response";
import { exec } from "child_process";
import path from "path";
import fs from "fs";

export class BitbucketProvider implements RepoProviderInterface {
	private readonly clientId = env.BITBUCKET_CLIENT_ID!;
	private readonly clientSecret = env.BITBUCKET_CLIENT_SECRET!;

	private botAccessToken: string | null = null;
	private botTokenExpiry: number = 0;

	private axios = axios.create({
		baseURL: "https://api.bitbucket.org/2.0",
		headers: {
			Accept: "application/json",
		},
	});

	private async safeRequest<T>(fn: () => Promise<T>): Promise<T> {
		try {
			return await fn();
		} catch (error) {
			if (error instanceof AxiosError) {
				throw new BitbucketError(
					error.response?.data?.error?.message ?? "Bitbucket error",
					error.response?.status ?? 500
				);
			}
			throw new BitbucketError(
				"Unexpected error while communicating with Bitbucket",
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
	}): Promise<CommonRepoDTO> {
		console.log("providerUserName", providerUserName);
		console.log("repoName", repoName);
		console.log("token", token);
		const { data } = await this.safeRequest(() =>
			this.axios.get<BitbucketRepoDTO>(
				`/repositories/${providerUserName}/${repoName}`,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			)
		);

		// Adaptar para o formato comum
		return {
			id: data.uuid,
			name: data.name,
			fullName: data.full_name,
			owner: {
				login: data.owner.username,
				avatarUrl: data.owner.links.avatar.href,
			},
			description: data.description,
			clone_url:
				data.links.clone.find((link) => link.name === "https")?.href || "",
			default_branch: data.mainbranch.name,
			private: data.is_private,
			language: data.language,
			html_url: data.links.html.href,
			nodeId: data.uuid,
		};
	}

	async getRepos(
		token: string,
		page: number,
		perPage: number
	): Promise<PaginatedResponse<CommonRepoDTO>> {
		const { data } = await this.safeRequest(() =>
			this.axios.get<{ values: BitbucketRepoDTO[] }>("/repositories", {
				headers: { Authorization: `Bearer ${token}` },
				params: {
					page: page.toString(),
					pagelen: perPage,
					role: "member",
				},
			})
		);

		// Adaptar para o formato comum
		const adaptedRepos = data.values.map((repo) => ({
			id: repo.uuid,
			name: repo.name,
			fullName: repo.full_name,
			owner: {
				login: repo.owner.username,
				avatarUrl: repo.owner.links.avatar.href,
			},
			description: repo.description,
			clone_url:
				repo.links.clone.find((link) => link.name === "https")?.href || "",
			default_branch: repo.mainbranch.name,
			private: repo.is_private,
			language: repo.language,
			html_url: repo.links.html.href,
			nodeId: repo.uuid,
		}));

		return {
			data: adaptedRepos,
			page: page,
			perPage: perPage,
		};
	}

	async fetchUser(token: string): Promise<CommonUserDTO> {
		const { data } = await this.safeRequest(() =>
			this.axios.get<BitbucketUserDTO>("/user", {
				headers: { Authorization: `Bearer ${token}` },
			})
		);

		// Adaptar para o formato comum
		return {
			id: data.account_id,
			login: data.username,
			name: data.display_name,
			avatar_url: data.links.avatar.href,
			email: data.email || null,
		};
	}

	async exchangeCodeForToken(code: string): Promise<{ accessToken: string }> {
		try {
			const response = await axios.post(
				"https://bitbucket.org/site/oauth2/access_token",
				new URLSearchParams({
					grant_type: "authorization_code",
					code,
					client_id: this.clientId,
					client_secret: this.clientSecret,
					redirect_uri: "http://localhost:3000/auth/bitbucket/callback",
				}).toString(),
				{
					headers: {
						"Content-Type": "application/x-www-form-urlencoded",
						Accept: "application/json",
					},
				}
			);

			return { accessToken: response.data.access_token };
		} catch (error) {
			if (error instanceof AxiosError) {
				throw new BitbucketError(
					error.response?.data?.error_description ?? "Bitbucket error",
					error.response?.status ?? 500
				);
			}
			throw error instanceof BitbucketError
				? error
				: new BitbucketError(
						"An unexpected error occurred while exchanging code for token",
						500
				  );
		}
	}

	async cloneRepo(data: {
		repoName: string;
		providerUserName: string;
		repoBranch: string;
	}) {
		const botAccessToken = await this.getBotAccessToken();
		const TEMP_DIR = path.resolve("./temp");
		const LOCAL_REPO_PATH = path.join(TEMP_DIR, data?.repoName);

		if (this.isRepoCloned(LOCAL_REPO_PATH)) {
			console.log("Repository already cloned!");
			return;
		}

		// Bitbucket usa um formato diferente para URLs de clone com token
		const remote = `https://x-token-auth:${botAccessToken}@bitbucket.org/${data?.providerUserName}/${data?.repoName}.git`;

		return new Promise<void>((resolve, reject) => {
			exec(
				`git clone -b ${data?.repoBranch} ${remote} ${LOCAL_REPO_PATH}`,
				(err, stdout, stderr) => {
					if (err) {
						console.error(
							`Error cloning repository ${data?.repoName}:`,
							stderr
						);
						return reject(new Error(`Failed to clone repository: ${stderr}`));
					}

					console.log(
						`✅ Repository ${data?.repoName} cloned successfully to ${LOCAL_REPO_PATH}!`
					);
					resolve();
				}
			);
		});
	}

	private isRepoCloned(localRepoPath: string): boolean {
		return fs.existsSync(localRepoPath);
	}

	async getPullRequest(data: {
		repoName: string;
		providerUserName: string;
		prNumber: number;
	}): Promise<CommonPullRequestFileDTO[]> {
		const botAccessToken = await this.getBotAccessToken();
		const { data: pullRequestFiles } = await this.safeRequest(() =>
			this.axios.get<{ values: BitbucketPullRequestFileDTO[] }>(
				`/repositories/${data?.providerUserName}/${data?.repoName}/pullrequests/${data?.prNumber}/diffstat`,
				{
					headers: { Authorization: `Bearer ${botAccessToken}` },
				}
			)
		);
		// Adaptar para o formato comum
		return pullRequestFiles.values.map((file) => ({
			sha: file.new?.commit?.hash || file.old?.commit?.hash || "",
			filename: file.new?.path || file.old?.path || "",
			status: file.status,
			additions: file.lines_added,
			deletions: file.lines_removed,
			changes: file.lines_added + file.lines_removed,
			blob_url: "", // Bitbucket não fornece blob_url diretamente
			raw_url: "", // Bitbucket não fornece raw_url diretamente
			contents_url: "", // Bitbucket não fornece contents_url diretamente
			patch: file.new?.path,
			previous_filename:
				file.old?.path !== file.new?.path ? file.old?.path : undefined,
		}));
	}

	async commentOnPullRequest(data: {
		repoName: string;
		providerUserName: string;
		prNumber: number;
		comment: string;
	}) {
		const botAccessToken = await this.getBotAccessToken();
		const { data: comment } = await this.safeRequest(() =>
			this.axios.post(
				`/repositories/${data?.providerUserName}/${data?.repoName}/pullrequests/${data?.prNumber}/comments`,
				{ content: { raw: data?.comment } },
				{ headers: { Authorization: `Bearer ${botAccessToken}` } }
			)
		);

		return comment;
	}

	async getPullRequestDiff(data: {
		repoName: string;
		providerUserName: string;
		prNumber: number;
	}): Promise<string> {
		// Retorna uma string, não um DTO
		const token = await this.getBotAccessToken(); // Obtém o token do bot

		// É importante notar que o Bitbucket retorna text/plain, não JSON.
		// Axios lida bem com isso por padrão, interpretando a resposta como texto.
		try {
			const response = await this.axios.get<string>( // Especifica que a resposta é string
				`/repositories/${data.providerUserName}/${data.repoName}/pullrequests/${data.prNumber}/diff`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						Accept: "text/plain", // Opcional, mas boa prática para indicar o formato esperado
					},
					responseType: "text", // Garante que o Axios não tente parsear como JSON
				}
			);
			return response.data; // O diff bruto estará aqui
		} catch (error) {
			// Tratamento de erro similar ao safeRequest, mas sem passá-lo para safeRequest
			if (error instanceof AxiosError) {
				console.error(
					`Error fetching PR diff (${error.response?.status}):`,
					error.response?.data
				);
				throw new BitbucketError(
					`Failed to get PR diff: ${
						error.response?.statusText || "Unknown error"
					}`,
					error.response?.status ?? 500
				);
			}
			throw new BitbucketError("Unexpected error fetching PR diff.", 500);
		}
	}

	async commentOnIssue(data: {
		repoName: string;
		providerUserName: string;
		token: string;
		title: string;
		body: string;
	}) {
		const { data: issue } = await this.safeRequest(() =>
			this.axios.post(
				`/repositories/${data?.providerUserName}/${data?.repoName}/issues`,
				{
					title: data?.title,
					content: { raw: data?.body },
					kind: "bug", // Tipo padrão para issues no Bitbucket
				},
				{
					headers: {
						Authorization: `Bearer ${data?.token}`,
					},
				}
			)
		);

		return issue;
	}

	private async getBotAccessToken(): Promise<string> {
		if (this.botAccessToken && Date.now() < this.botTokenExpiry - 5000) {
			return this.botAccessToken;
		}
		console.log("Getting new bot access token...");
		try {
			const response = await axios.post(
				"https://bitbucket.org/site/oauth2/access_token",
				new URLSearchParams({ grant_type: "client_credentials" }).toString(),
				{
					headers: {
						"Content-Type": "application/x-www-form-urlencoded",
						Authorization: `Basic ${Buffer.from(
							`${this.clientId}:${this.clientSecret}`
						).toString("base64")}`,
					},
				}
			);
			this.botAccessToken = response.data.access_token;
			this.botTokenExpiry = Date.now() + response.data.expires_in * 1000;
			return this.botAccessToken ?? "";
		} catch (error) {
			throw new BitbucketError("Failed to get bot access token", 500);
		}
	}
}
