import { escapeHtml } from "@/lib/format";
import {
	RunnerTimeoutError,
	runPhpCode,
	type RunnerResult,
	type RunnerStatus,
} from "./use-code-runner";

const READY_MESSAGE = "Pronto para executar.";
const EDITOR_INDENT = "    ";

function setupCodeRunner(): void {
	const sandboxes = Array.from(
		document.querySelectorAll<HTMLElement>("[data-php-sandbox]"),
	);
	if (sandboxes.length === 0) return;

	for (const sandbox of sandboxes) {
		if (sandbox.dataset.sandboxReady === "true") continue;
		sandbox.dataset.sandboxReady = "true";
		setupSandbox(sandbox);
	}
}

function setupSandbox(sandbox: HTMLElement): void {
	const controls = sandbox.querySelector<HTMLElement>(
		"[data-sandbox-controls]",
	);
	const staticBlock = sandbox.querySelector<HTMLElement>("[data-code-surface]");
	const editor = sandbox.querySelector<HTMLElement>("[data-sandbox-editor]");
	const editorInput = sandbox.querySelector<HTMLTextAreaElement>(
		"[data-sandbox-editor-input]",
	);
	const editorHighlight = sandbox.querySelector<HTMLElement>(
		"[data-sandbox-editor-highlight]",
	);
	const runButton =
		sandbox.querySelector<HTMLButtonElement>("[data-sandbox-run]");
	const runLabel = sandbox.querySelector<HTMLElement>(
		"[data-sandbox-run-label]",
	);
	const editButton = sandbox.querySelector<HTMLButtonElement>(
		"[data-sandbox-edit]",
	);
	const editLabel = sandbox.querySelector<HTMLElement>(
		"[data-sandbox-edit-label]",
	);
	const status = sandbox.querySelector<HTMLElement>("[data-sandbox-status]");
	const result = sandbox.querySelector<HTMLElement>("[data-sandbox-result]");
	const resultOutput = sandbox.querySelector<HTMLElement>(
		"[data-sandbox-result-output]",
	);
	const resultLabel = sandbox.querySelector<HTMLElement>(
		"[data-sandbox-result-label]",
	);
	const resultMeta = sandbox.querySelector<HTMLElement>(
		"[data-sandbox-result-meta]",
	);
	const resultDot = sandbox.querySelector<HTMLElement>(
		"[data-sandbox-result-dot]",
	);

	if (
		!controls ||
		!staticBlock ||
		!editor ||
		!editorInput ||
		!editorHighlight ||
		!runButton ||
		!editButton ||
		!status ||
		!result ||
		!resultOutput ||
		!resultLabel ||
		!resultMeta ||
		!resultDot
	) {
		return;
	}

	// Fonte única do código original: o próprio <pre> renderizado pelo Shiki
	// (mesmo padrão que o botão de copiar em doc-reader.ts já usa), em vez de
	// duplicar o código num textarea oculto à parte.
	const initialCode = staticBlock.querySelector("pre")?.textContent ?? "";
	let editing = false;

	controls.hidden = false;
	setStatus(status, READY_MESSAGE);
	updateEditorView(editorInput, editorHighlight);

	const runSandboxCode = () => {
		if (runButton.disabled) return;
		void runCurrentCode({
			code: editing ? editorInput.value : initialCode,
			runLabel,
			editButton,
			status,
			result,
			resultOutput,
			resultLabel,
			resultMeta,
			resultDot,
		});
	};

	runButton.addEventListener("click", runSandboxCode);

	editButton.addEventListener("click", () => {
		editing = !editing;
		setEditing({
			editing,
			initialCode,
			staticBlock,
			editor,
			editorInput,
			editorHighlight,
			editButton,
			editLabel,
		});
	});

	editorInput.addEventListener("input", () => {
		updateEditorView(editorInput, editorHighlight);
	});
	editorInput.addEventListener("keydown", (event) => {
		if (event.isComposing) return;

		if (event.key === "Tab") {
			event.preventDefault();
			if (event.shiftKey) outdentTextareaSelection(editorInput);
			else indentTextareaSelection(editorInput);
			updateEditorView(editorInput, editorHighlight);
			return;
		}

		if (event.key === "Escape" || event.key === "Esc") {
			event.preventDefault();
			if (!editing) return;
			editing = false;
			setEditing({
				editing,
				initialCode,
				staticBlock,
				editor,
				editorInput,
				editorHighlight,
				editButton,
				editLabel,
			});
			editButton.focus();
			return;
		}

		if (event.key === "Enter" && event.ctrlKey) {
			event.preventDefault();
			runSandboxCode();
		}
	});
	editorInput.addEventListener("scroll", () => {
		syncEditorScroll(editorInput, editorHighlight);
	});
}

function setEditing(options: {
	editing: boolean;
	initialCode: string;
	staticBlock: HTMLElement;
	editor: HTMLElement;
	editorInput: HTMLTextAreaElement;
	editorHighlight: HTMLElement;
	editButton: HTMLButtonElement;
	editLabel: HTMLElement | null;
}): void {
	const {
		editing,
		initialCode,
		staticBlock,
		editor,
		editorInput,
		editorHighlight,
		editButton,
		editLabel,
	} = options;

	if (editing) {
		editor.style.setProperty(
			"--sandbox-editor-height",
			`${Math.ceil(staticBlock.getBoundingClientRect().height)}px`,
		);
	} else {
		editor.style.removeProperty("--sandbox-editor-height");
		// Sair do modo sandbox descarta as edições: o leitor sempre encontra o
		// exemplo original da próxima vez que abrir o editor.
		editorInput.value = initialCode;
		updateEditorView(editorInput, editorHighlight);
	}

	staticBlock.hidden = editing;
	editor.hidden = !editing;
	editButton.setAttribute("aria-pressed", String(editing));
	if (editLabel) editLabel.textContent = "Sandbox";

	if (editing) {
		updateEditorView(editorInput, editorHighlight);
		editorInput.setSelectionRange(0, 0);
		editorInput.focus({ preventScroll: true });
	}
}

async function runCurrentCode(options: {
	code: string;
	runLabel: HTMLElement | null;
	editButton: HTMLButtonElement;
	status: HTMLElement;
	result: HTMLElement;
	resultOutput: HTMLElement;
	resultLabel: HTMLElement;
	resultMeta: HTMLElement;
	resultDot: HTMLElement;
}): Promise<void> {
	const {
		code,
		runLabel,
		editButton,
		status,
		result,
		resultOutput,
		resultLabel,
		resultMeta,
		resultDot,
	} = options;

	// Desabilita TODOS os botões "Executar" da página (não só o desta sandbox):
	// o runtime php-wasm roda uma execução por vez, então permitir cliques em
	// outras sandboxes enfileiraria silenciosamente sem indicar qual resultado
	// pertence a qual clique.
	setAllRunButtonsDisabled(true);
	setBusy([editButton], true);
	if (runLabel) runLabel.textContent = "Executando";
	renderLoading(result, resultOutput, resultLabel, resultMeta, resultDot);

	try {
		const runResult = await runPhpCode(code, (state) => {
			renderRunnerStatus(state, status, resultOutput);
		});
		renderResult(
			runResult,
			result,
			resultOutput,
			resultLabel,
			resultMeta,
			resultDot,
		);
		setStatus(status, "Execução concluída no navegador.");
	} catch (error) {
		renderFailure(
			error,
			result,
			resultOutput,
			resultLabel,
			resultMeta,
			resultDot,
		);
		setStatus(status, "Não foi possível concluir esta execução.");
	} finally {
		setAllRunButtonsDisabled(false);
		setBusy([editButton], false);
		if (runLabel) runLabel.textContent = "Executar";
	}
}

function renderRunnerStatus(
	state: RunnerStatus,
	status: HTMLElement,
	output: HTMLElement,
): void {
	if (state === "loading") {
		setStatus(status, "Carregando PHP 8.4 no navegador...");
		output.textContent =
			"Baixando e inicializando o runtime PHP. A primeira execução pode demorar.";
		return;
	}

	setStatus(status, "Executando o código no sandbox local...");
	output.textContent = "Executando...";
}

function renderLoading(
	result: HTMLElement,
	output: HTMLElement,
	label: HTMLElement,
	meta: HTMLElement,
	dot: HTMLElement,
): void {
	result.hidden = false;
	label.textContent = "Preparando";
	meta.textContent = "";
	output.textContent = "Preparando sandbox...";
	setDot(dot, "info");
}

function renderResult(
	runResult: RunnerResult,
	result: HTMLElement,
	output: HTMLElement,
	label: HTMLElement,
	meta: HTMLElement,
	dot: HTMLElement,
): void {
	const stdout = runResult.stdout.trimEnd();
	const stderr = runResult.stderr.trimEnd();
	const hasError = runResult.exitCode !== 0 || stderr.length > 0;
	const text = [stdout, stderr && `STDERR:\n${stderr}`]
		.filter(Boolean)
		.join("\n\n");

	result.hidden = false;
	label.textContent = hasError ? "Saída real com aviso" : "Saída real";
	meta.textContent = `exit ${runResult.exitCode} · ${formatDuration(runResult.durationMs)}`;
	output.textContent = text || "(sem saída)";
	setDot(dot, hasError ? "warn" : "good");
}

function renderFailure(
	error: unknown,
	result: HTMLElement,
	output: HTMLElement,
	label: HTMLElement,
	meta: HTMLElement,
	dot: HTMLElement,
): void {
	result.hidden = false;
	label.textContent = "Falha no sandbox";
	meta.textContent = "";
	output.textContent =
		error instanceof RunnerTimeoutError
			? "Execução interrompida após 6s. Revise loops infinitos ou operações muito pesadas."
			: formatError(error);
	setDot(dot, "danger");
}

function setBusy(buttons: HTMLButtonElement[], busy: boolean): void {
	for (const button of buttons) {
		if (button.hidden) continue;
		button.disabled = busy;
	}
}

function setAllRunButtonsDisabled(disabled: boolean): void {
	for (const button of document.querySelectorAll<HTMLButtonElement>(
		"[data-sandbox-run]",
	)) {
		button.disabled = disabled;
	}
}

function setStatus(target: HTMLElement, message: string): void {
	target.textContent = message;
}

function setDot(
	dot: HTMLElement,
	tone: "danger" | "good" | "info" | "warn",
): void {
	const token = {
		danger: "--color-tone-danger",
		good: "--color-tone-good",
		info: "--color-tone-info",
		warn: "--color-tone-warn",
	}[tone];
	dot.style.background = `var(${token})`;
}

function formatDuration(value: number): string {
	if (value < 1000) return `${Math.max(1, Math.round(value))} ms`;
	return `${(value / 1000).toFixed(1)} s`;
}

function formatError(error: unknown): string {
	if (error instanceof Error) return error.message;
	return String(error);
}

function renderEditorHighlight(target: HTMLElement, code: string): void {
	target.innerHTML = tokenizePhp(code).join("");
}

function updateEditorView(
	input: HTMLTextAreaElement,
	highlight: HTMLElement,
): void {
	renderEditorHighlight(highlight, input.value);
	syncEditorScroll(input, highlight);
}

function syncEditorScroll(
	input: HTMLTextAreaElement,
	highlight: HTMLElement,
): void {
	highlight.style.transform = `translate(${-input.scrollLeft}px, ${-input.scrollTop}px)`;
}

function indentTextareaSelection(input: HTMLTextAreaElement): void {
	const { selectionStart, selectionEnd, value } = input;

	if (selectionStart === selectionEnd) {
		input.setRangeText(EDITOR_INDENT, selectionStart, selectionEnd, "end");
		return;
	}

	const { lineStart, lineEnd } = getSelectedLineRange(
		value,
		selectionStart,
		selectionEnd,
	);
	const selectedLines = value.slice(lineStart, lineEnd);
	const lines = selectedLines.split("\n");
	const replacement = lines.map((line) => `${EDITOR_INDENT}${line}`).join("\n");
	const delta = EDITOR_INDENT.length * lines.length;

	input.value = value.slice(0, lineStart) + replacement + value.slice(lineEnd);
	input.setSelectionRange(
		selectionStart + EDITOR_INDENT.length,
		selectionEnd + delta,
	);
}

function outdentTextareaSelection(input: HTMLTextAreaElement): void {
	const { selectionStart, selectionEnd, value } = input;
	const { lineStart, lineEnd } = getSelectedLineRange(
		value,
		selectionStart,
		selectionEnd,
	);
	const selectedLines = value.slice(lineStart, lineEnd);
	const lines = selectedLines.split("\n");
	let offset = 0;
	let removedBeforeStart = 0;
	let removedBeforeEnd = 0;

	const replacement = lines
		.map((line) => {
			const removeCount = getOutdentCount(line);
			const removeStart = lineStart + offset;
			const removeEnd = removeStart + removeCount;
			removedBeforeStart += countRemovedBeforePosition(
				selectionStart,
				removeStart,
				removeEnd,
			);
			removedBeforeEnd += countRemovedBeforePosition(
				selectionEnd,
				removeStart,
				removeEnd,
			);
			offset += line.length + 1;
			return line.slice(removeCount);
		})
		.join("\n");

	input.value = value.slice(0, lineStart) + replacement + value.slice(lineEnd);
	const nextStart = Math.max(lineStart, selectionStart - removedBeforeStart);
	const nextEnd = Math.max(nextStart, selectionEnd - removedBeforeEnd);
	input.setSelectionRange(nextStart, nextEnd);
}

function getSelectedLineRange(
	value: string,
	selectionStart: number,
	selectionEnd: number,
): { lineStart: number; lineEnd: number } {
	const lineStart =
		value.lastIndexOf("\n", Math.max(0, selectionStart - 1)) + 1;
	const selectionEndForLine =
		selectionEnd > selectionStart && value[selectionEnd - 1] === "\n"
			? selectionEnd - 1
			: selectionEnd;
	const nextLineBreak = value.indexOf("\n", selectionEndForLine);
	const lineEnd = nextLineBreak === -1 ? value.length : nextLineBreak;
	return { lineStart, lineEnd };
}

function getOutdentCount(line: string): number {
	if (line.startsWith("\t")) return 1;
	const leadingSpaces = line.match(/^ +/)?.[0].length ?? 0;
	return Math.min(EDITOR_INDENT.length, leadingSpaces);
}

function countRemovedBeforePosition(
	position: number,
	removeStart: number,
	removeEnd: number,
): number {
	if (position <= removeStart) return 0;
	return Math.min(position, removeEnd) - removeStart;
}

function tokenizePhp(code: string): string[] {
	const tokens =
		code.match(
			/<\?php|\?>|\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\$[A-Za-z_]\w*|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*(?=\s*\()|\b[A-Za-z_]\w*\b|\r?\n|[^\S\r\n]+|./g,
		) ?? [];

	return tokens.map((token) => {
		const escaped = escapeHtml(token);
		const className = getPhpTokenClass(token);
		return className ? `<span class="${className}">${escaped}</span>` : escaped;
	});
}

function getPhpTokenClass(token: string): string | null {
	if (token === "<?php" || token === "?>") return "sandbox-token-tag";
	if (token.startsWith("//") || token.startsWith("/*"))
		return "sandbox-token-comment";
	if (token.startsWith('"') || token.startsWith("'"))
		return "sandbox-token-string";
	if (token.startsWith("$")) return "sandbox-token-variable";
	if (/^\d/.test(token)) return "sandbox-token-number";
	if (PHP_KEYWORDS.has(token)) return "sandbox-token-keyword";
	if (/^[A-Za-z_]\w*$/.test(token)) return "sandbox-token-function";
	return null;
}

const PHP_KEYWORDS = new Set([
	"abstract",
	"and",
	"array",
	"as",
	"bool",
	"break",
	"case",
	"catch",
	"class",
	"clone",
	"const",
	"continue",
	"default",
	"echo",
	"else",
	"elseif",
	"extends",
	"false",
	"final",
	"finally",
	"float",
	"fn",
	"for",
	"foreach",
	"function",
	"global",
	"if",
	"implements",
	"int",
	"interface",
	"match",
	"mixed",
	"namespace",
	"new",
	"null",
	"or",
	"private",
	"protected",
	"public",
	"readonly",
	"return",
	"static",
	"string",
	"switch",
	"throw",
	"trait",
	"true",
	"try",
	"use",
	"var",
	"void",
	"while",
	"xor",
]);

document.addEventListener("astro:page-load", setupCodeRunner);
