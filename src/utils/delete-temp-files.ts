import { rm } from "fs/promises";

export async function deleteTempDir(path: string) {
	try {
		await rm(path, { recursive: true, force: true });
		console.log(`Temp dir "${path}" deleted successfully.`);
	} catch (error) {
		console.error(`Error deleting directory:`, error);
	}
}
