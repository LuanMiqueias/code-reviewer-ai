import fs from "fs";

export async function deleteTempDir(TEMP_DIR: string) {
	try {
		if (fs.existsSync(TEMP_DIR)) {
			fs.rmSync(TEMP_DIR, { recursive: true, force: true });
		}
		console.log(`Temp dir "${TEMP_DIR}" deleted successfully.`);
	} catch (error) {
		console.error(`Error deleting directory:`, error);
	}
}
