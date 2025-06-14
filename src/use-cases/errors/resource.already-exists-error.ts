export class ResourceAlreadyExistsError extends Error {
	constructor(resourceName: string) {
		super(`${resourceName} already exists.`);
	}
}
