import { prisma } from "../../lib/prisma";
import { Prisma, ProviderType } from "@prisma/client";
import { AccountRepository } from "../account.repository";

export class PrismaAccountRepository implements AccountRepository {
	async create(data: Prisma.AccountCreateInput) {
		const account = await prisma.account.create({
			data,
		});

		return account;
	}
	async findByProviderAndProviderUserId(
		provider: ProviderType,
		providerUserId: string
	) {
		const account = await prisma.account.findUnique({
			where: {
				provider_providerUserId: {
					provider,
					providerUserId,
				},
			},
			include: {
				user: true,
			},
		});

		return account;
	}
	async updateProviderAccessToken(id: string, newAccessToken: string) {
		const account = await prisma.account.update({
			where: { id },
			data: { accessToken: newAccessToken },
		});

		return account;
	}
}
