export const parseIssuesFromAIResponse = (
	raw: string
): { title: string; body: string } | null => {
	const cleaned = raw.replace(/^```json\s*/i, "").replace(/\s*```$/, "");

	try {
		return JSON.parse(cleaned);
	} catch (err) {
		console.error("Erro ao fazer parse do JSON da IA:", err);
		return null;
	}
};
