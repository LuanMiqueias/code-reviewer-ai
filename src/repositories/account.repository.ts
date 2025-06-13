import { Account, Prisma, ProviderType, User } from "@prisma/client";

export interface AccountRepository {
	create(data: Prisma.AccountCreateInput): Promise<Account>;
	findByProviderAndProviderUserId(
		provider: ProviderType,
		providerUserId: string
	): Promise<(Account & { user: User }) | null>;
	updateProviderAccessToken(
		id: string,
		newAccessToken: string
	): Promise<Account>;
}
