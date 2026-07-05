/**
 * Utilitários de formatação de conteúdo — port fiel de `assets/js/docs-core.js`
 * (`escapeHtml`, `formatInlineTokens`, `splitCodeAndExpectedOutput`,
 * `normalizeCodeLanguage`), com uma melhoria: também interpretamos `**negrito**`
 * (o renderer legado só tratava crases e deixava os `**` literais).
 */

export function escapeHtml(value: unknown): string {
	return String(value ?? "")
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

/**
 * Escapa e converte tokens inline: `` `code` `` -> <code>, `**bold**` -> <strong>.
 * Devolve HTML seguro para usar com `set:html`.
 */
export function formatInline(value: unknown): string {
	return escapeHtml(value)
		.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
		.replace(/`([^`]+)`/g, "<code>$1</code>");
}

/**
 * Separa o código de um bloco de "Saída" embutido como comentário final
 * (`/* Saída: ... *&#47;`). Muitas entries guardam a saída esperada dentro do
 * próprio código; o renderer legado extraía para exibir num painel à parte.
 */
export function splitCodeAndOutput(codeText: unknown): {
	code: string;
	output: string;
} {
	const raw = String(codeText ?? "").replace(/\r\n/g, "\n");
	const match = raw.match(/\n\/\*\nSa[íi]da:\n([\s\S]*?)\n\*\/\s*$/);
	if (!match || match.index === undefined) {
		return { code: raw.trimEnd(), output: "" };
	}
	const output = String(match[1] ?? "").trimEnd();
	const code = raw.slice(0, match.index).trimEnd();
	return { code, output };
}

/** Normaliza o identificador de linguagem para um id que o Shiki entende. */
export function normalizeLang(value: unknown): string {
	const lang = String(value ?? "")
		.toLowerCase()
		.replace(/[^a-z0-9_+-]/g, "");
	if (["php"].includes(lang)) return "php";
	if (["js", "javascript"].includes(lang)) return "javascript";
	if (["ts", "typescript"].includes(lang)) return "typescript";
	if (["go", "golang"].includes(lang)) return "go";
	if (["html", "htm", "xml", "xhtml"].includes(lang)) return "html";
	if (["css"].includes(lang)) return "css";
	if (["json"].includes(lang)) return "json";
	if (["yaml", "yml"].includes(lang)) return "yaml";
	if (["sql", "mysql", "postgres", "postgresql", "sqlite"].includes(lang))
		return "sql";
	if (["shell", "bash", "sh", "zsh", "console"].includes(lang)) return "bash";
	if (["powershell", "ps1"].includes(lang)) return "powershell";
	if (!lang || lang === "plain" || lang === "text") return "text";
	return lang;
}

/**
 * Resolve o output de uma entry: campo explícito `output` tem prioridade;
 * senão, usa o output embutido no comentário de código.
 */
export function resolveEntryCode(entry: {
	code?: string;
	output?: string;
	codeLanguage?: string;
}): { code: string; output: string; lang: string } {
	const split = splitCodeAndOutput(entry.code);
	const output = (entry.output ?? "").trim() || split.output;
	return { code: split.code, output, lang: normalizeLang(entry.codeLanguage) };
}
