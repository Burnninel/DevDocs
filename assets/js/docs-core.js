(function () {
	"use strict";

	const CALL_OUT_TYPES = new Set(["hint", "warn", "danger"]);
	const MARK_CLASS_BY_TYPE = {
		hint: "mark-info",
		warn: "mark-warn",
		danger: "mark-danger",
	};
	const SECTION_LAYOUTS = new Set(["two", "single"]);
	const EDIT_HANDLE_ICON = `
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" focusable="false">
			<path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
		</svg>`;
	const EDIT_CONFIRM_ICON = `
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" focusable="false">
			<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
		</svg>`;
	const EDIT_CANCEL_ICON = `
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" focusable="false">
			<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
		</svg>`;

	function escapeHtml(value) {
		return String(value ?? "")
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#39;");
	}

	function formatInlineTokens(value) {
		const escaped = escapeHtml(value ?? "");
		return escaped.replace(/`([^`]+)`/g, "<code>$1</code>");
	}

	function normalizeText(value) {
		return String(value ?? "")
			.toLowerCase()
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "");
	}

	function safeClassToken(value) {
		const token = String(value ?? "plain")
			.toLowerCase()
			.replace(/[^a-z0-9_-]/g, "");
		return token || "plain";
	}

	function normalizeCodeLanguage(value) {
		const lang = safeClassToken(value);
		if (["php"].includes(lang)) return "php";
		if (["js", "javascript", "ts", "typescript"].includes(lang))
			return "javascript";
		if (["html", "htm", "xml", "xhtml"].includes(lang)) return "html";
		if (["sql", "mysql", "postgres", "postgresql", "sqlite"].includes(lang))
			return "sql";
		if (
			["shell", "bash", "sh", "zsh", "powershell", "ps1", "cmd"].includes(
				lang,
			)
		)
			return "shell";
		return lang || "plain";
	}

	function detectCodeLanguage(entry, defaultLanguage, codeText) {
		const entryLang = normalizeCodeLanguage(entry?.codeLanguage || "");
		if (entryLang && entryLang !== "plain") return entryLang;

		const defaultLang = normalizeCodeLanguage(defaultLanguage || "");
		if (defaultLang && defaultLang !== "plain") return defaultLang;

		const raw = String(codeText ?? "");
		if (/<\?php\b/i.test(raw)) return "php";
		if (
			/<\/?[a-z][a-z0-9-]*(?:\s[^>]*)?>/i.test(raw) ||
			/<!doctype\s+html/i.test(raw)
		)
			return "html";
		if (
			/\b(select|insert|update|delete)\b[\s\S]{0,80}\b(from|into|set)\b/i.test(
				raw,
			)
		)
			return "sql";
		if (
			/\b(const|let|var|function|import|export|console|async|await)\b/.test(
				raw,
			) ||
			raw.includes("=>")
		) {
			return "javascript";
		}
		return "plain";
	}

	function highlightPhp(codeText) {
		const source = String(codeText ?? "");
		let index = 0;
		let out = "";

		const keywordSet = new Set([
			"array",
			"as",
			"break",
			"case",
			"catch",
			"class",
			"const",
			"continue",
			"default",
			"echo",
			"else",
			"elseif",
			"empty",
			"extends",
			"false",
			"finally",
			"fn",
			"for",
			"foreach",
			"function",
			"if",
			"implements",
			"include",
			"include_once",
			"interface",
			"list",
			"match",
			"namespace",
			"new",
			"null",
			"print",
			"private",
			"protected",
			"public",
			"require",
			"require_once",
			"return",
			"static",
			"switch",
			"throw",
			"trait",
			"true",
			"try",
			"use",
			"while",
			"yield",
		]);

		const funcSet = new Set([
			"array_filter",
			"array_map",
			"array_reduce",
			"array_push",
			"array_pop",
			"array_shift",
			"array_search",
			"array_key_exists",
			"array_merge",
			"array_column",
			"array_unique",
			"count",
			"in_array",
			"isset",
			"ksort",
			"krsort",
			"sort",
			"rsort",
			"asort",
			"arsort",
			"print_r",
			"var_dump",
			"number_format",
		]);

		const opList = [
			"=>",
			"->",
			"::",
			"===",
			"!==",
			"==",
			"!=",
			"<=",
			">=",
			"&&",
			"||",
			"??",
		];

		const appendToken = (className, text) => {
			const safe = escapeHtml(text);
			out += className
				? `<span class="${className}">${safe}</span>`
				: safe;
		};

		const isWordStart = (char) => /[A-Za-z_\x80-\xff]/.test(char || "");
		const isWordPart = (char) => /[A-Za-z0-9_\x80-\xff]/.test(char || "");
		const isDigit = (char) => /[0-9]/.test(char || "");

		while (index < source.length) {
			const rest = source.slice(index);
			const current = source[index];
			const next = source[index + 1];

			if (rest.startsWith("<?php")) {
				appendToken("tok-tag", "<?php");
				index += 5;
				continue;
			}
			if (rest.startsWith("?>")) {
				appendToken("tok-tag", "?>");
				index += 2;
				continue;
			}

			if (current === "/" && next === "*") {
				const end = source.indexOf("*/", index + 2);
				const final = end === -1 ? source.length : end + 2;
				appendToken("tok-comment", source.slice(index, final));
				index = final;
				continue;
			}
			if (current === "/" && next === "/") {
				let end = index + 2;
				while (end < source.length && source[end] !== "\n") end += 1;
				appendToken("tok-comment", source.slice(index, end));
				index = end;
				continue;
			}
			if (current === "#") {
				let end = index + 1;
				while (end < source.length && source[end] !== "\n") end += 1;
				appendToken("tok-comment", source.slice(index, end));
				index = end;
				continue;
			}

			if (current === '"' || current === "'") {
				const quote = current;
				let end = index + 1;
				while (end < source.length) {
					if (source[end] === "\\" && end + 1 < source.length) {
						end += 2;
						continue;
					}
					if (source[end] === quote) {
						end += 1;
						break;
					}
					end += 1;
				}
				appendToken("tok-string", source.slice(index, end));
				index = end;
				continue;
			}

			if (current === "$" && isWordStart(next)) {
				let end = index + 2;
				while (end < source.length && isWordPart(source[end])) end += 1;
				appendToken("tok-variable", source.slice(index, end));
				index = end;
				continue;
			}

			if (isDigit(current)) {
				let end = index + 1;
				while (end < source.length && isDigit(source[end])) end += 1;
				if (source[end] === "." && isDigit(source[end + 1])) {
					end += 1;
					while (end < source.length && isDigit(source[end]))
						end += 1;
				}
				appendToken("tok-number", source.slice(index, end));
				index = end;
				continue;
			}

			if (isWordStart(current)) {
				let end = index + 1;
				while (end < source.length && isWordPart(source[end])) end += 1;
				const word = source.slice(index, end);
				const lower = word.toLowerCase();

				if (keywordSet.has(lower)) appendToken("tok-keyword", word);
				else if (funcSet.has(lower)) appendToken("tok-func", word);
				else appendToken("", word);

				index = end;
				continue;
			}

			const matchedOp = opList.find((op) => rest.startsWith(op));
			if (matchedOp) {
				appendToken("tok-operator", matchedOp);
				index += matchedOp.length;
				continue;
			}

			if (/[=+\-*\/%<>!]/.test(current)) {
				appendToken("tok-operator", current);
				index += 1;
				continue;
			}

			if (/[{}\[\]();,:.]/.test(current)) {
				appendToken("tok-punctuation", current);
				index += 1;
				continue;
			}

			appendToken("", current);
			index += 1;
		}

		return out;
	}

	function highlightJavascript(codeText) {
		const source = String(codeText ?? "");
		let index = 0;
		let out = "";

		const keywordSet = new Set([
			"as",
			"async",
			"await",
			"break",
			"case",
			"catch",
			"class",
			"const",
			"continue",
			"debugger",
			"default",
			"delete",
			"do",
			"else",
			"export",
			"extends",
			"false",
			"finally",
			"for",
			"from",
			"function",
			"if",
			"import",
			"in",
			"instanceof",
			"let",
			"new",
			"null",
			"of",
			"return",
			"static",
			"super",
			"switch",
			"this",
			"throw",
			"true",
			"try",
			"typeof",
			"undefined",
			"var",
			"void",
			"while",
			"with",
			"yield",
		]);

		const opList = [
			"===",
			"!==",
			"=>",
			"==",
			"!=",
			">=",
			"<=",
			"&&",
			"||",
			"??",
			"?.",
			"++",
			"--",
			"+=",
			"-=",
			"*=",
			"/=",
			"%=",
			"**",
		];

		const appendToken = (className, text) => {
			const safe = escapeHtml(text);
			out += className
				? `<span class="${className}">${safe}</span>`
				: safe;
		};

		const isWordStart = (char) => /[A-Za-z_$]/.test(char || "");
		const isWordPart = (char) => /[A-Za-z0-9_$]/.test(char || "");
		const isDigit = (char) => /[0-9]/.test(char || "");
		const skipWs = (pos) => {
			let nextPos = pos;
			while (nextPos < source.length && /\s/.test(source[nextPos]))
				nextPos += 1;
			return nextPos;
		};

		while (index < source.length) {
			const rest = source.slice(index);
			const current = source[index];
			const next = source[index + 1];

			if (current === "/" && next === "*") {
				const end = source.indexOf("*/", index + 2);
				const final = end === -1 ? source.length : end + 2;
				appendToken("tok-comment", source.slice(index, final));
				index = final;
				continue;
			}
			if (current === "/" && next === "/") {
				let end = index + 2;
				while (end < source.length && source[end] !== "\n") end += 1;
				appendToken("tok-comment", source.slice(index, end));
				index = end;
				continue;
			}

			if (current === "'" || current === '"' || current === "`") {
				const quote = current;
				let end = index + 1;
				while (end < source.length) {
					if (source[end] === "\\" && end + 1 < source.length) {
						end += 2;
						continue;
					}
					if (source[end] === quote) {
						end += 1;
						break;
					}
					end += 1;
				}
				appendToken("tok-string", source.slice(index, end));
				index = end;
				continue;
			}

			if (isDigit(current)) {
				let end = index + 1;
				while (end < source.length && isDigit(source[end])) end += 1;
				if (source[end] === "." && isDigit(source[end + 1])) {
					end += 1;
					while (end < source.length && isDigit(source[end]))
						end += 1;
				}
				appendToken("tok-number", source.slice(index, end));
				index = end;
				continue;
			}

			if (isWordStart(current)) {
				let end = index + 1;
				while (end < source.length && isWordPart(source[end])) end += 1;
				const word = source.slice(index, end);
				const lower = word.toLowerCase();

				if (keywordSet.has(lower)) {
					appendToken("tok-keyword", word);
				} else {
					const nextPos = skipWs(end);
					if (source[nextPos] === "(") appendToken("tok-func", word);
					else appendToken("", word);
				}

				index = end;
				continue;
			}

			const matchedOp = opList.find((op) => rest.startsWith(op));
			if (matchedOp) {
				appendToken("tok-operator", matchedOp);
				index += matchedOp.length;
				continue;
			}

			if (/[=+\-*\/%<>!?|&^~]/.test(current)) {
				appendToken("tok-operator", current);
				index += 1;
				continue;
			}

			if (/[{}\[\]();,:.]/.test(current)) {
				appendToken("tok-punctuation", current);
				index += 1;
				continue;
			}

			appendToken("", current);
			index += 1;
		}

		return out;
	}

	function highlightSql(codeText) {
		const source = String(codeText ?? "");
		let index = 0;
		let out = "";

		const keywordSet = new Set([
			"add",
			"all",
			"alter",
			"and",
			"as",
			"asc",
			"between",
			"by",
			"case",
			"create",
			"cross",
			"cte",
			"database",
			"default",
			"delete",
			"desc",
			"distinct",
			"drop",
			"else",
			"end",
			"exists",
			"from",
			"full",
			"group",
			"having",
			"if",
			"in",
			"inner",
			"insert",
			"into",
			"is",
			"join",
			"left",
			"like",
			"limit",
			"not",
			"null",
			"offset",
			"on",
			"or",
			"order",
			"outer",
			"primary",
			"replace",
			"right",
			"select",
			"set",
			"table",
			"then",
			"top",
			"truncate",
			"union",
			"unique",
			"update",
			"values",
			"view",
			"when",
			"where",
			"with",
		]);

		const funcSet = new Set([
			"avg",
			"coalesce",
			"concat",
			"count",
			"current_date",
			"current_timestamp",
			"date_trunc",
			"lower",
			"max",
			"min",
			"now",
			"round",
			"sum",
			"substring",
			"trim",
			"upper",
		]);

		const opList = ["<>", ">=", "<=", "!=", "||", ":=", "->", "->>"];

		const appendToken = (className, text) => {
			const safe = escapeHtml(text);
			out += className
				? `<span class="${className}">${safe}</span>`
				: safe;
		};

		const isWordStart = (char) => /[A-Za-z_]/.test(char || "");
		const isWordPart = (char) => /[A-Za-z0-9_$]/.test(char || "");
		const isDigit = (char) => /[0-9]/.test(char || "");
		const skipWs = (pos) => {
			let nextPos = pos;
			while (nextPos < source.length && /\s/.test(source[nextPos]))
				nextPos += 1;
			return nextPos;
		};

		while (index < source.length) {
			const rest = source.slice(index);
			const current = source[index];
			const next = source[index + 1];

			if (current === "/" && next === "*") {
				const end = source.indexOf("*/", index + 2);
				const final = end === -1 ? source.length : end + 2;
				appendToken("tok-comment", source.slice(index, final));
				index = final;
				continue;
			}
			if (current === "-" && next === "-") {
				let end = index + 2;
				while (end < source.length && source[end] !== "\n") end += 1;
				appendToken("tok-comment", source.slice(index, end));
				index = end;
				continue;
			}

			if (current === "'" || current === '"') {
				const quote = current;
				let end = index + 1;
				while (end < source.length) {
					if (
						quote === "'" &&
						source[end] === "'" &&
						source[end + 1] === "'"
					) {
						end += 2;
						continue;
					}
					if (source[end] === quote) {
						end += 1;
						break;
					}
					end += 1;
				}
				appendToken("tok-string", source.slice(index, end));
				index = end;
				continue;
			}

			if ((current === ":" || current === "@") && isWordStart(next)) {
				let end = index + 2;
				while (end < source.length && isWordPart(source[end])) end += 1;
				appendToken("tok-variable", source.slice(index, end));
				index = end;
				continue;
			}

			if (current === "$" && /[0-9A-Za-z_]/.test(next || "")) {
				let end = index + 2;
				while (end < source.length && /[0-9A-Za-z_]/.test(source[end]))
					end += 1;
				appendToken("tok-variable", source.slice(index, end));
				index = end;
				continue;
			}

			if (isDigit(current)) {
				let end = index + 1;
				while (end < source.length && isDigit(source[end])) end += 1;
				if (source[end] === "." && isDigit(source[end + 1])) {
					end += 1;
					while (end < source.length && isDigit(source[end]))
						end += 1;
				}
				appendToken("tok-number", source.slice(index, end));
				index = end;
				continue;
			}

			if (isWordStart(current)) {
				let end = index + 1;
				while (end < source.length && isWordPart(source[end])) end += 1;
				const word = source.slice(index, end);
				const lower = word.toLowerCase();

				if (keywordSet.has(lower)) {
					appendToken("tok-keyword", word);
				} else if (funcSet.has(lower) || source[skipWs(end)] === "(") {
					appendToken("tok-func", word);
				} else {
					appendToken("", word);
				}

				index = end;
				continue;
			}

			const matchedOp = opList.find((op) => rest.startsWith(op));
			if (matchedOp) {
				appendToken("tok-operator", matchedOp);
				index += matchedOp.length;
				continue;
			}

			if (/[=+\-*\/%<>!]/.test(current)) {
				appendToken("tok-operator", current);
				index += 1;
				continue;
			}

			if (/[{}\[\]();,.:]/.test(current)) {
				appendToken("tok-punctuation", current);
				index += 1;
				continue;
			}

			appendToken("", current);
			index += 1;
		}

		return out;
	}

	function highlightHtmlTag(tagText) {
		const source = String(tagText ?? "");
		let index = 0;
		let out = "";

		const appendToken = (className, text) => {
			const safe = escapeHtml(text);
			out += className
				? `<span class="${className}">${safe}</span>`
				: safe;
		};

		const isNameStart = (char) => /[A-Za-z:_]/.test(char || "");
		const isNamePart = (char) => /[A-Za-z0-9:._-]/.test(char || "");

		if (source[index] === "<") {
			appendToken("tok-punctuation", "<");
			index += 1;
		}

		while (index < source.length && /[!/?]/.test(source[index])) {
			appendToken("tok-punctuation", source[index]);
			index += 1;
		}

		if (isNameStart(source[index])) {
			let end = index + 1;
			while (end < source.length && isNamePart(source[end])) end += 1;
			appendToken("tok-tag", source.slice(index, end));
			index = end;
		}

		while (index < source.length) {
			const current = source[index];

			if (current === "/" && source[index + 1] === ">") {
				appendToken("tok-punctuation", "/>");
				index += 2;
				continue;
			}
			if (current === ">") {
				appendToken("tok-punctuation", ">");
				index += 1;
				continue;
			}
			if (/\s/.test(current)) {
				appendToken("", current);
				index += 1;
				continue;
			}

			if (isNameStart(current)) {
				let end = index + 1;
				while (end < source.length && isNamePart(source[end])) end += 1;
				appendToken("tok-attr", source.slice(index, end));
				index = end;

				while (index < source.length && /\s/.test(source[index])) {
					appendToken("", source[index]);
					index += 1;
				}

				if (source[index] === "=") {
					appendToken("tok-operator", "=");
					index += 1;
					while (index < source.length && /\s/.test(source[index])) {
						appendToken("", source[index]);
						index += 1;
					}

					if (source[index] === '"' || source[index] === "'") {
						const quote = source[index];
						let valueEnd = index + 1;
						while (valueEnd < source.length) {
							if (
								source[valueEnd] === "\\" &&
								valueEnd + 1 < source.length
							) {
								valueEnd += 2;
								continue;
							}
							if (source[valueEnd] === quote) {
								valueEnd += 1;
								break;
							}
							valueEnd += 1;
						}
						appendToken(
							"tok-string",
							source.slice(index, valueEnd),
						);
						index = valueEnd;
					} else {
						let valueEnd = index;
						while (
							valueEnd < source.length &&
							!/[\s>]/.test(source[valueEnd])
						)
							valueEnd += 1;
						appendToken(
							"tok-string",
							source.slice(index, valueEnd),
						);
						index = valueEnd;
					}
				}
				continue;
			}

			appendToken("", current);
			index += 1;
		}

		return out;
	}

	function highlightHtml(codeText) {
		const source = String(codeText ?? "");
		let index = 0;
		let out = "";

		const appendToken = (className, text) => {
			const safe = escapeHtml(text);
			out += className
				? `<span class="${className}">${safe}</span>`
				: safe;
		};

		while (index < source.length) {
			if (source.startsWith("<!--", index)) {
				const end = source.indexOf("-->", index + 4);
				const final = end === -1 ? source.length : end + 3;
				appendToken("tok-comment", source.slice(index, final));
				index = final;
				continue;
			}

			if (source[index] === "<") {
				const end = source.indexOf(">", index + 1);
				if (end === -1) {
					appendToken("", source.slice(index));
					break;
				}
				out += highlightHtmlTag(source.slice(index, end + 1));
				index = end + 1;
				continue;
			}

			let nextTag = source.indexOf("<", index);
			if (nextTag === -1) nextTag = source.length;
			appendToken("", source.slice(index, nextTag));
			index = nextTag;
		}

		return out;
	}

	function highlightCode(codeText, language) {
		const lang = normalizeCodeLanguage(language);
		if (lang === "php") return highlightPhp(codeText);
		if (lang === "javascript") return highlightJavascript(codeText);
		if (lang === "sql") return highlightSql(codeText);
		if (lang === "html") return highlightHtml(codeText);
		return escapeHtml(codeText ?? "");
	}

	function renderShortcutHint(hintElement, text) {
		if (!hintElement) return;
		const raw = String(text ?? "").trim();
		if (!raw) {
			hintElement.textContent = "";
			return;
		}

		const slashIndex = raw.indexOf("/");
		if (slashIndex === -1) {
			hintElement.textContent = raw;
			return;
		}

		const before = raw.slice(0, slashIndex);
		const after = raw.slice(slashIndex + 1);
		hintElement.textContent = "";
		hintElement.append(document.createTextNode(before));
		const strong = document.createElement("strong");
		strong.textContent = "/";
		hintElement.append(strong);
		hintElement.append(document.createTextNode(after));
	}

	function resolveLayout(layout, fallbackLayout) {
		if (SECTION_LAYOUTS.has(layout)) return layout;
		if (SECTION_LAYOUTS.has(fallbackLayout)) return fallbackLayout;
		return "two";
	}

	function deriveTabs(docData, sections) {
		const fallbackTabs = sections.map((section) => ({
			target: section.id,
			label: section.name,
		}));

		if (!Array.isArray(docData.tabs) || !docData.tabs.length) {
			return fallbackTabs;
		}

		const validSectionIds = new Set(sections.map((section) => section.id));
		const explicitTabs = docData.tabs
			.map((tab) => ({
				target: String(tab?.target ?? ""),
				label: String(tab?.label ?? ""),
			}))
			.filter((tab) => tab.target && validSectionIds.has(tab.target))
			.map((tab) => ({
				target: tab.target,
				label:
					tab.label ||
					sections.find((section) => section.id === tab.target)
						?.name ||
					tab.target,
			}));

		return explicitTabs.length ? explicitTabs : fallbackTabs;
	}

	function editableAttrs(path, type, label) {
		const safePath = escapeHtml(path || "");
		const safeType = escapeHtml(safeClassToken(type || "text"));
		const safeLabel = escapeHtml(label || "");
		return ` data-editable="true" data-edit-path="${safePath}" data-edit-type="${safeType}" data-edit-label="${safeLabel}"`;
	}

	function markEditableNode(node, path, type, label) {
		if (!node) return;
		node.setAttribute("data-editable", "true");
		node.setAttribute("data-edit-path", String(path || ""));
		node.setAttribute("data-edit-type", safeClassToken(type || "text"));
		node.setAttribute("data-edit-label", String(label || ""));
	}

	function ensureEditHandles(container) {
		if (!container) return;
		const editableNodes = container.querySelectorAll(
			'[data-editable="true"]',
		);
		editableNodes.forEach((node) => {
			node.classList.add("editable-target");
			if (node.querySelector(".edit-handle")) return;

			const label = node.getAttribute("data-edit-label") || "conteúdo";
			const handle = document.createElement("button");
			handle.type = "button";
			handle.className = "edit-handle";
			handle.setAttribute("aria-label", `Editar ${label}`);
			handle.setAttribute("title", `Editar ${label}`);
			handle.innerHTML = EDIT_HANDLE_ICON;
			node.append(handle);
		});
	}

	function getOrCreateEditableContent(target, type) {
		if (!target || safeClassToken(type) === "code") return null;
		let content = target.querySelector(":scope > .editable-content");
		if (!content) {
			content = document.createElement("span");
			content.className = "editable-content";
			const movableNodes = Array.from(target.childNodes).filter(
				(node) => {
					return !(
						node.nodeType === Node.ELEMENT_NODE &&
						(node.classList?.contains("edit-handle") ||
							node.classList?.contains("edit-actions"))
					);
				},
			);
			movableNodes.forEach((node) => content.append(node));
			target.prepend(content);
		}
		return content;
	}

	function setCaretToEnd(node) {
		if (!node) return;
		const selection = window.getSelection?.();
		if (!selection || typeof document.createRange !== "function") return;
		const range = document.createRange();
		range.selectNodeContents(node);
		range.collapse(false);
		selection.removeAllRanges();
		selection.addRange(range);
	}

	function readEditableValue(node) {
		if (!node) return "";
		const raw =
			typeof node.innerText === "string"
				? node.innerText
				: node.textContent;
		return String(raw ?? "").replace(/\r\n/g, "\n");
	}

	function createEditActionButton(kind, label, iconMarkup) {
		const button = document.createElement("button");
		button.type = "button";
		button.className = `edit-handle edit-action-btn ${kind}`;
		button.setAttribute("aria-label", label);
		button.setAttribute("title", label);
		button.innerHTML = iconMarkup;
		return button;
	}

	function mountInlineEditActions(target, label) {
		if (!target) return null;
		let actions = target.querySelector(":scope > .edit-actions");
		if (actions) return actions;

		actions = document.createElement("div");
		actions.className = "edit-actions";

		const applyButton = createEditActionButton(
			"confirm",
			`Confirmar ${label}`,
			EDIT_CONFIRM_ICON,
		);
		const cancelButton = createEditActionButton(
			"cancel",
			`Cancelar edição de ${label}`,
			EDIT_CANCEL_ICON,
		);

		actions.append(applyButton, cancelButton);
		target.append(actions);
		return actions;
	}

	function renderEntry(entry, defaultCodeLanguage, sectionIndex, entryIndex) {
		const title = escapeHtml(entry.title);
		const kicker = escapeHtml(entry.kicker);
		const descriptionClass =
			entry.descriptionTone === "warn" ? "em-warn" : "";
		const descriptionClassAttr = descriptionClass
			? ` class="${descriptionClass}"`
			: "";
		const description = formatInlineTokens(entry.description);
		const language = detectCodeLanguage(
			entry,
			defaultCodeLanguage,
			entry.code,
		);
		const languageClass = safeClassToken(language);
		const code = highlightCode(entry.code, languageClass);
		const spanClass = entry.span === "full" ? " span-full" : "";
		const pathPrefix = `sections.${sectionIndex}.entries.${entryIndex}`;
		const titleAttrs = editableAttrs(
			`${pathPrefix}.title`,
			"title",
			"título do item",
		);
		const kickerAttrs = editableAttrs(
			`${pathPrefix}.kicker`,
			"subtitle",
			"subtítulo do item",
		);
		const descriptionAttrs = editableAttrs(
			`${pathPrefix}.description`,
			"multiline",
			"descrição do item",
		);
		const codeAttrs = editableAttrs(
			`${pathPrefix}.code`,
			"code",
			"bloco de código",
		);

		const tags = Array.isArray(entry.tags)
			? entry.tags.join(" ")
			: String(entry.tags ?? "");
		const safeTags = escapeHtml(tags.trim());

		let calloutMarkup = "";
		if (entry.callout && CALL_OUT_TYPES.has(entry.callout.type)) {
			const type = entry.callout.type;
			const label = escapeHtml(entry.callout.label);
			const text = formatInlineTokens(entry.callout.text);
			const markClass = MARK_CLASS_BY_TYPE[type] || "mark-info";
			const calloutTextAttrs = editableAttrs(
				`${pathPrefix}.callout.text`,
				"multiline",
				"texto do aviso",
			);

			calloutMarkup = `
        <div class="${type} code-head">
          <div class="callout-copy"><strong class="${markClass}">${label}</strong> <span${calloutTextAttrs}>${text}</span></div>
        </div>`;
		}

		return `
      <article class="entry${spanClass}" data-tags="${safeTags}">
        <div class="entry-head">
          <h3${titleAttrs}>${title}</h3>
          <div class="entry-kicker"${kickerAttrs}>${kicker}</div>
        </div>
        <div class="entry-body">
          <p${descriptionClassAttr}${descriptionAttrs}>${description}</p>
          ${calloutMarkup}
          <pre${codeAttrs}><code class="code-block language-${languageClass}">${code}</code></pre>
        </div>
      </article>`;
	}

	function renderFromData(docData) {
		const titleEl = document.getElementById("docTitle");
		const subtitleEl = document.getElementById("docSubtitle");
		const shortcutEl = document.getElementById("shortcutHint");
		const tabsContainer = document.getElementById("tabsContainer");
		const sectionsContainer = document.getElementById("sectionsContainer");
		const searchInput = document.getElementById("searchInput");

		if (titleEl) {
			titleEl.textContent = docData.title || "";
			markEditableNode(
				titleEl,
				"title",
				"title",
				"título da documentação",
			);
		}
		if (subtitleEl) {
			subtitleEl.textContent = docData.subtitle || "";
			markEditableNode(
				subtitleEl,
				"subtitle",
				"subtitle",
				"subtítulo da documentação",
			);
		}
		if (docData.title) document.title = docData.title;

		if (searchInput && docData.searchPlaceholder) {
			searchInput.setAttribute("placeholder", docData.searchPlaceholder);
		}

		renderShortcutHint(shortcutEl, docData.shortcutHint);

		const sections = Array.isArray(docData.sections)
			? docData.sections
			: [];
		const tabs = deriveTabs(docData, sections);

		if (tabsContainer) {
			tabsContainer.innerHTML = tabs
				.map((tab, index) => {
					const target = escapeHtml(tab.target);
					const label = escapeHtml(tab.label);
					const activeClass = index === 0 ? " active" : "";
					return `<a class="tab-link${activeClass}" href="#${target}">${label}</a>`;
				})
				.join("");
		}

		if (sectionsContainer) {
			const defaultLayout = resolveLayout(
				docData.defaultSectionLayout,
				"two",
			);
			const defaultCodeLanguage = safeClassToken(
				docData.codeLanguage || "",
			);
			sectionsContainer.innerHTML = sections
				.map((section, sectionIndex) => {
					const id = escapeHtml(section.id);
					const name = escapeHtml(section.name);
					const layout = resolveLayout(section.layout, defaultLayout);
					const entries = Array.isArray(section.entries)
						? section.entries
						: [];
					const sectionTitleAttrs = editableAttrs(
						`sections.${sectionIndex}.name`,
						"title",
						"título da seção",
					);
					return `
            <section id="${id}" class="doc-section layout-${layout}" data-section-name="${name}" data-layout="${layout}">
              <div class="section-head">
                <h2${sectionTitleAttrs}>${name}</h2>
              </div>
              <div class="entry-grid">
                ${entries
					.map((entry, entryIndex) =>
						renderEntry(
							entry,
							defaultCodeLanguage,
							sectionIndex,
							entryIndex,
						),
					)
					.join("")}
              </div>
            </section>`;
				})
				.join("");
		}
	}

	function getValueByPath(source, path) {
		if (!source || !path) return undefined;
		return String(path)
			.split(".")
			.reduce((current, segment) => {
				if (current == null) return undefined;
				if (Array.isArray(current) && /^\d+$/.test(segment)) {
					return current[Number(segment)];
				}
				return current[segment];
			}, source);
	}

	function setValueByPath(target, path, value) {
		if (!target || !path) return;
		const segments = String(path).split(".");
		if (!segments.length) return;

		let current = target;
		for (let index = 0; index < segments.length - 1; index += 1) {
			const segment = segments[index];
			const nextSegment = segments[index + 1];
			const isArrayIndex = /^\d+$/.test(nextSegment);

			if (Array.isArray(current) && /^\d+$/.test(segment)) {
				const numeric = Number(segment);
				if (current[numeric] == null) {
					current[numeric] = isArrayIndex ? [] : {};
				}
				current = current[numeric];
				continue;
			}

			if (current[segment] == null) {
				current[segment] = isArrayIndex ? [] : {};
			}

			current = current[segment];
		}

		const last = segments[segments.length - 1];
		if (Array.isArray(current) && /^\d+$/.test(last)) {
			current[Number(last)] = value;
		} else {
			current[last] = value;
		}
	}

	function deepCloneData(value) {
		return JSON.parse(JSON.stringify(value));
	}

	function mergeDraftIntoDocData(baseData, draftChanges) {
		const snapshot = deepCloneData(baseData || {});
		if (!(draftChanges instanceof Map)) return snapshot;
		draftChanges.forEach((fieldValue, path) => {
			setValueByPath(snapshot, path, fieldValue);
		});
		return snapshot;
	}

	function replaceObjectContent(target, source) {
		if (!target || !source) return;
		Object.keys(target).forEach((key) => {
			delete target[key];
		});
		Object.assign(target, deepCloneData(source));
	}

	function buildDocDataFileContent(docId, payload) {
		const safeDocId = JSON.stringify(String(docId || ""));
		const json = JSON.stringify(payload, null, "\t");
		return `window.DOC_DATA_REGISTRY = window.DOC_DATA_REGISTRY || {};\nwindow.DOC_DATA_REGISTRY[${safeDocId}] = ${json};\n`;
	}

	function resolveDocDataFilename(docId) {
		const scripts = Array.from(document.querySelectorAll("script[src]"));
		const currentDataScript = scripts.find((script) =>
			/data\/[^?#]+\.data\.js(?:[?#].*)?$/i.test(
				script.getAttribute("src") || "",
			),
		);
		if (currentDataScript) {
			const src = currentDataScript.getAttribute("src") || "";
			const match = src.match(
				/\/?data\/([^/?#]+\.data\.js)(?:[?#].*)?$/i,
			);
			if (match && match[1]) return match[1];
		}
		return `${docId || "documentacao"}.data.js`;
	}

	function triggerFileDownload(filename, content, mimeType) {
		const blob = new Blob([content], {
			type: mimeType || "application/octet-stream;charset=utf-8",
		});
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement("a");
		anchor.href = url;
		anchor.download = filename;
		document.body.append(anchor);
		anchor.click();
		anchor.remove();
		setTimeout(() => URL.revokeObjectURL(url), 2000);
	}

	function initializeInteractions() {
		const appShell = document.querySelector(".app-shell");
		const editModeToggle = document.getElementById("editModeToggle");
		const saveDataButton = document.getElementById("saveDataButton");
		const searchInput = document.getElementById("searchInput");
		const emptyState = document.getElementById("emptyState");
		const sections = Array.from(document.querySelectorAll(".doc-section"));
		const tabs = Array.from(document.querySelectorAll(".tab-link"));
		const appHeader = document.querySelector(".app-header");
		const searchRow = appHeader?.querySelector(".search-row");
		const editorState = {
			isEditMode: false,
			draftChanges: new Map(),
			activeEditor: null,
			fileHandle: null,
			isSaving: false,
		};
		let pendingIndicator = null;

		if (appShell) {
			appShell.__docEditorState = editorState;
			ensureEditHandles(appShell);
		}

		if (!searchInput || !sections.length) {
			return;
		}

		function updateHeaderOffset() {
			const offset = appHeader
				? Math.ceil(appHeader.getBoundingClientRect().height)
				: 140;
			document.documentElement.style.setProperty(
				"--header-offset",
				`${offset}px`,
			);
		}

		function ensurePendingIndicator() {
			if (!searchRow) return null;
			const existing = searchRow.querySelector("#editPendingIndicator");
			if (existing) {
				if (
					saveDataButton &&
					saveDataButton.parentElement === searchRow &&
					existing.nextElementSibling !== saveDataButton
				) {
					searchRow.insertBefore(existing, saveDataButton);
				}
				return existing;
			}

			const indicator = document.createElement("span");
			indicator.id = "editPendingIndicator";
			indicator.className = "edit-pending-indicator";
			indicator.setAttribute("role", "status");
			indicator.setAttribute("aria-live", "polite");
			indicator.textContent = "";

			if (saveDataButton && saveDataButton.parentElement === searchRow) {
				searchRow.insertBefore(indicator, saveDataButton);
			} else {
				searchRow.append(indicator);
			}
			return indicator;
		}

		function getBaseFieldValue(path, type) {
			const sourceValue = getValueByPath(docData, path);
			return normalizeFieldValue(
				sourceValue == null ? "" : sourceValue,
				type,
			);
		}

		function getPendingCount() {
			return editorState.draftChanges.size;
		}

		function updateDirtyMarkers() {
			if (!appShell) return;
			const editableNodes = appShell.querySelectorAll(
				'[data-editable="true"]',
			);
			editableNodes.forEach((node) => {
				const path = node.getAttribute("data-edit-path") || "";
				const isDirty =
					Boolean(path) && editorState.draftChanges.has(path);
				node.classList.toggle("is-dirty", isDirty);
			});
		}

		function updatePendingIndicator() {
			if (!pendingIndicator) {
				pendingIndicator = ensurePendingIndicator();
			}

			const pendingCount = getPendingCount();
			if (pendingIndicator) {
				if (pendingCount > 0) {
					pendingIndicator.textContent =
						pendingCount === 1
							? "1 pendência"
							: `${pendingCount} pendências`;
					pendingIndicator.classList.add("is-visible");
				} else {
					pendingIndicator.textContent = "";
					pendingIndicator.classList.remove("is-visible");
				}
			}

			if (appShell) {
				appShell.classList.toggle(
					"has-pending-edits",
					pendingCount > 0,
				);
			}

			if (saveDataButton) {
				saveDataButton.disabled =
					pendingCount === 0 || editorState.isSaving;
				saveDataButton.textContent = editorState.isSaving
					? "Salvando..."
					: "Salvar";
			}

			updateDirtyMarkers();
			updateHeaderOffset();
		}

		function getCurrentFieldValue(path) {
			if (!path) return "";
			if (editorState.draftChanges.has(path)) {
				return String(editorState.draftChanges.get(path) ?? "");
			}
			const sourceValue = getValueByPath(docData, path);
			return sourceValue == null ? "" : String(sourceValue);
		}

		function normalizeFieldValue(value, type) {
			const normalizedType = safeClassToken(type || "text");
			let nextValue = String(value ?? "").replace(/\r\n/g, "\n");
			if (normalizedType === "title" || normalizedType === "subtitle") {
				nextValue = nextValue.replace(/\n+/g, " ").trim();
			}
			return nextValue;
		}

		function getCodeLanguageFromNode(codeNode) {
			if (!codeNode) return "plain";
			const classToken = Array.from(codeNode.classList).find((token) =>
				token.startsWith("language-"),
			);
			if (!classToken) return "plain";
			return normalizeCodeLanguage(classToken.slice("language-".length));
		}

		function updateLinkedTabLabel(sectionId, value) {
			if (!sectionId) return;
			const tab = tabs.find(
				(node) => node.getAttribute("href") === `#${sectionId}`,
			);
			if (tab) {
				tab.textContent = value;
			}
		}

		function renderFieldValue(target, path, type, value) {
			if (!target) return;
			const normalizedType = safeClassToken(
				type || target.dataset.editType || "text",
			);
			const safeValue = String(value ?? "");
			const handle = target.querySelector(":scope > .edit-handle");

			if (normalizedType === "code") {
				let codeEl = target.querySelector("code.code-block");
				if (!codeEl) {
					codeEl = document.createElement("code");
					codeEl.className = "code-block language-plain";
					target.prepend(codeEl);
				}

				const currentLanguage = getCodeLanguageFromNode(codeEl);
				const inferredLanguage =
					currentLanguage !== "plain"
						? currentLanguage
						: detectCodeLanguage(
								undefined,
								docData?.codeLanguage || "",
								safeValue,
							);

				codeEl.className = `code-block language-${safeClassToken(inferredLanguage)}`;
				codeEl.innerHTML = highlightCode(safeValue, inferredLanguage);
			} else if (normalizedType === "multiline") {
				const contentEl = getOrCreateEditableContent(
					target,
					normalizedType,
				);
				contentEl.innerHTML = formatInlineTokens(safeValue);
			} else {
				const contentEl = getOrCreateEditableContent(
					target,
					normalizedType,
				);
				contentEl.innerHTML = escapeHtml(safeValue);
			}

			if (handle) {
				target.append(handle);
			}

			if (path === "title") {
				document.title = safeValue || "Documentação";
			}

			if (/^sections\.\d+\.name$/.test(path)) {
				const sectionNode = target.closest(".doc-section");
				if (sectionNode) {
					sectionNode.dataset.sectionName = safeValue;
					updateLinkedTabLabel(sectionNode.id, safeValue);
				}
			}
		}

		function commitSnapshot(snapshot) {
			if (!snapshot) return;
			replaceObjectContent(docData, snapshot);
			editorState.draftChanges.clear();
			updatePendingIndicator();
		}

		function supportsDirectFileSave() {
			return (
				typeof window !== "undefined" &&
				typeof window.showSaveFilePicker === "function"
			);
		}

		async function requestWritePermission(handle) {
			if (!handle) return false;
			const options = { mode: "readwrite" };
			if (typeof handle.queryPermission === "function") {
				const state = await handle.queryPermission(options);
				if (state === "granted") return true;
			}
			if (typeof handle.requestPermission === "function") {
				const state = await handle.requestPermission(options);
				return state === "granted";
			}
			return true;
		}

		async function ensureWritableFileHandle() {
			if (!supportsDirectFileSave()) return null;

			if (editorState.fileHandle) {
				const allowed = await requestWritePermission(
					editorState.fileHandle,
				);
				if (allowed) return editorState.fileHandle;
				editorState.fileHandle = null;
			}

			const pickerOptions = {
				suggestedName: resolveDocDataFilename(docId),
				excludeAcceptAllOption: false,
				types: [
					{
						description: "Arquivo de dados da documentação",
						accept: {
							"text/javascript": [".js"],
							"application/json": [".json"],
						},
					},
				],
			};
			const handle = await window.showSaveFilePicker(pickerOptions);
			const allowed = await requestWritePermission(handle);
			if (!allowed) {
				throw new Error(
					"Permissão de gravação negada para o arquivo selecionado.",
				);
			}
			editorState.fileHandle = handle;
			return handle;
		}

		async function saveDraftChangesToFile() {
			if (editorState.activeEditor) {
				applyActiveEditor();
			}

			if (getPendingCount() === 0 || editorState.isSaving) return;

			const mergedSnapshot = mergeDraftIntoDocData(
				docData,
				editorState.draftChanges,
			);
			const fileContent = buildDocDataFileContent(docId, mergedSnapshot);
			const filename = resolveDocDataFilename(docId);

			editorState.isSaving = true;
			updatePendingIndicator();

			try {
				const handle = await ensureWritableFileHandle();
				if (!handle) {
					throw new Error(
						"Navegador sem suporte para gravação direta de arquivos.",
					);
				}

				const writable = await handle.createWritable();
				await writable.write(fileContent);
				await writable.close();
				commitSnapshot(mergedSnapshot);
			} catch (error) {
				if (error && error.name === "AbortError") {
					return;
				}

				triggerFileDownload(
					filename,
					fileContent,
					"text/javascript;charset=utf-8",
				);
				window.alert(
					"Não foi possível salvar diretamente no arquivo do projeto. " +
						"Baixei uma cópia atualizada para você substituir manualmente no diretório data/.",
				);
			} finally {
				editorState.isSaving = false;
				updatePendingIndicator();
			}
		}

		function closeEditor(options = {}) {
			const { focusHandle = false } = options;
			if (!editorState.activeEditor) return;

			const { target, editorElement, contentElement, path, type } =
				editorState.activeEditor;
			if (contentElement) {
				contentElement.onkeydown = null;
				contentElement.removeAttribute("contenteditable");
				contentElement.removeAttribute("role");
				contentElement.removeAttribute("aria-label");
				contentElement.removeAttribute("spellcheck");
				contentElement.removeAttribute("aria-multiline");
			}
			if (editorElement && editorElement.parentNode) {
				editorElement.remove();
			}
			if (target && path) {
				renderFieldValue(
					target,
					path,
					type,
					getCurrentFieldValue(path),
				);
			}
			target.classList.remove("is-editing");

			const handle = target.querySelector(":scope > .edit-handle");
			editorState.activeEditor = null;
			updateHeaderOffset();

			if (focusHandle && handle && editorState.isEditMode) {
				handle.focus({ preventScroll: true });
			}
		}

		function applyActiveEditor() {
			if (!editorState.activeEditor) return;
			const { path, type, target, inputElement, contentElement } =
				editorState.activeEditor;
			const rawValue = contentElement
				? readEditableValue(contentElement)
				: inputElement.value;
			const nextValue = normalizeFieldValue(rawValue, type);
			const baseValue = getBaseFieldValue(path, type);
			if (nextValue === baseValue) {
				editorState.draftChanges.delete(path);
			} else {
				editorState.draftChanges.set(path, nextValue);
			}
			renderFieldValue(target, path, type, nextValue);
			closeEditor({ focusHandle: false });
			updatePendingIndicator();
			filterEntries();
		}

		function openEditor(target) {
			if (!target || !editorState.isEditMode) return;

			const path = target.getAttribute("data-edit-path") || "";
			const type = safeClassToken(
				target.getAttribute("data-edit-type") || "text",
			);
			const label = target.getAttribute("data-edit-label") || "campo";
			const currentValue = getCurrentFieldValue(path);
			const supportsDirectTextEditing = type !== "code";

			if (editorState.activeEditor?.target === target) {
				const focusTarget =
					editorState.activeEditor.contentElement ||
					editorState.activeEditor.inputElement;
				focusTarget?.focus();
				return;
			}

			closeEditor({ focusHandle: false });

			if (supportsDirectTextEditing) {
				const contentElement = getOrCreateEditableContent(target, type);
				const actions = mountInlineEditActions(target, label);
				const applyButton = actions?.querySelector(
					".edit-action-btn.confirm",
				);
				const cancelButton = actions?.querySelector(
					".edit-action-btn.cancel",
				);

				target.classList.add("is-editing");
				contentElement.innerHTML = escapeHtml(currentValue);
				contentElement.setAttribute("contenteditable", "true");
				contentElement.setAttribute("role", "textbox");
				contentElement.setAttribute("aria-label", `Editar ${label}`);
				contentElement.setAttribute("spellcheck", "false");
				if (type === "multiline") {
					contentElement.setAttribute("aria-multiline", "true");
				} else {
					contentElement.removeAttribute("aria-multiline");
				}

				applyButton?.addEventListener("click", applyActiveEditor);
				cancelButton?.addEventListener("click", () => {
					closeEditor({ focusHandle: false });
				});

				contentElement.onkeydown = (event) => {
					if (event.key === "Escape") {
						event.preventDefault();
						closeEditor({ focusHandle: true });
						return;
					}

					if (type !== "multiline" && event.key === "Enter") {
						event.preventDefault();
						applyActiveEditor();
						return;
					}

					if (
						type === "multiline" &&
						event.key === "Enter" &&
						(event.ctrlKey || event.metaKey)
					) {
						event.preventDefault();
						applyActiveEditor();
					}
				};

				editorState.activeEditor = {
					target,
					path,
					type,
					label,
					editorElement: actions,
					contentElement,
					inputElement: null,
				};

				updateHeaderOffset();
				requestAnimationFrame(() => {
					contentElement.focus();
					setCaretToEnd(contentElement);
				});
				return;
			}

			const isTextArea = type === "code" || type === "multiline";

			const editorElement = document.createElement("div");
			editorElement.className = `inline-editor${type === "code" ? " is-code" : ""}`;

			const inputElement = isTextArea
				? document.createElement("textarea")
				: document.createElement("input");
			inputElement.className = isTextArea
				? "inline-editor-input inline-editor-textarea"
				: "inline-editor-input inline-editor-text";
			if (!isTextArea) {
				inputElement.type = "text";
			}

			inputElement.setAttribute("aria-label", `Editar ${label}`);
			inputElement.value = currentValue;

			if (isTextArea) {
				const rows = Math.max(
					3,
					Math.min(14, currentValue.split("\n").length + 1),
				);
				inputElement.rows = rows;
				if (type === "code") {
					inputElement.spellcheck = false;
					inputElement.setAttribute("data-editor-kind", "code");
				}
			}

			const actions = document.createElement("div");
			actions.className = "inline-editor-actions";

			const applyButton = document.createElement("button");
			applyButton.type = "button";
			applyButton.className = "inline-editor-btn apply";
			applyButton.textContent = "Aplicar";

			const cancelButton = document.createElement("button");
			cancelButton.type = "button";
			cancelButton.className = "inline-editor-btn cancel";
			cancelButton.textContent = "Cancelar";

			applyButton.addEventListener("click", () => {
				applyActiveEditor();
			});

			cancelButton.addEventListener("click", () => {
				closeEditor({ focusHandle: false });
			});

			inputElement.addEventListener("keydown", (event) => {
				if (event.key === "Escape") {
					event.preventDefault();
					closeEditor({ focusHandle: true });
					return;
				}

				if (!isTextArea && event.key === "Enter") {
					event.preventDefault();
					applyActiveEditor();
					return;
				}

				if (
					isTextArea &&
					event.key === "Enter" &&
					(event.ctrlKey || event.metaKey)
				) {
					event.preventDefault();
					applyActiveEditor();
				}
			});

			actions.append(applyButton, cancelButton);
			editorElement.append(inputElement, actions);

			target.classList.add("is-editing");
			target.append(editorElement);
			editorState.activeEditor = {
				target,
				path,
				type,
				label,
				editorElement,
				inputElement,
			};

			updateHeaderOffset();
			requestAnimationFrame(() => {
				inputElement.focus();
				if (!isTextArea) inputElement.select();
			});
		}

		function setEditMode(enabled) {
			const isEnabled = Boolean(enabled);
			editorState.isEditMode = isEnabled;

			if (appShell) {
				appShell.classList.toggle("is-edit-mode", isEnabled);
			}

			if (!isEnabled) {
				closeEditor({ focusHandle: false });
			}

			if (editModeToggle) {
				editModeToggle.setAttribute(
					"aria-pressed",
					isEnabled ? "true" : "false",
				);
				editModeToggle.setAttribute(
					"aria-label",
					isEnabled ? "Desativar modo edição" : "Ativar modo edição",
				);
			}

			updateHeaderOffset();
		}

		pendingIndicator = ensurePendingIndicator();
		updatePendingIndicator();
		if (saveDataButton && !supportsDirectFileSave()) {
			saveDataButton.title =
				"Navegador sem suporte para salvar direto no arquivo local. Será baixado um arquivo atualizado.";
		}

		if (saveDataButton) {
			saveDataButton.addEventListener("click", () => {
				void saveDraftChangesToFile();
			});
		}

		if (editModeToggle) {
			editModeToggle.addEventListener("click", () => {
				setEditMode(!editorState.isEditMode);
			});
		}

		if (appShell) {
			appShell.addEventListener("click", (event) => {
				if (event.target.closest(".edit-action-btn")) return;
				const handle = event.target.closest(".edit-handle");
				if (!handle) return;
				event.preventDefault();
				event.stopPropagation();
				openEditor(handle.closest('[data-editable="true"]'));
			});
		}

		function updateSectionsVisibility() {
			let totalVisible = 0;
			sections.forEach((section) => {
				const entries = Array.from(section.querySelectorAll(".entry"));
				const visible = entries.filter(
					(entry) => !entry.classList.contains("is-hidden"),
				);
				section.classList.toggle("is-hidden", visible.length === 0);
				totalVisible += visible.length;
			});

			if (emptyState) {
				emptyState.classList.toggle("is-visible", totalVisible === 0);
			}
		}

		function setActiveTab(id) {
			tabs.forEach((tab) => {
				const isActive = tab.getAttribute("href") === `#${id}`;
				tab.classList.toggle("active", isActive);
			});
		}

		function syncActiveTab() {
			if (!tabs.length) return;

			const visibleSections = sections.filter(
				(section) => !section.classList.contains("is-hidden"),
			);
			if (!visibleSections.length) {
				tabs.forEach((tab) => tab.classList.remove("active"));
				return;
			}

			const headerHeight = appHeader
				? appHeader.getBoundingClientRect().height
				: 0;
			const threshold = headerHeight + 28;
			let activeSection = visibleSections[0];

			for (const section of visibleSections) {
				const rect = section.getBoundingClientRect();
				if (rect.top - threshold <= 0) {
					activeSection = section;
				} else {
					break;
				}
			}

			setActiveTab(activeSection.id);
		}

		function filterEntries() {
			const query = normalizeText(searchInput.value.trim());
			sections.forEach((section) => {
				section.querySelectorAll(".entry").forEach((entry) => {
					const haystack = normalizeText(
						`${entry.dataset.tags || ""} ${entry.textContent}`,
					);
					const matches = !query || haystack.includes(query);
					entry.classList.toggle("is-hidden", !matches);
				});
			});

			updateSectionsVisibility();
			syncActiveTab();
		}

		tabs.forEach((tab) => {
			tab.addEventListener("click", (event) => {
				const targetId = tab.getAttribute("href")?.slice(1);
				const target = targetId
					? document.getElementById(targetId)
					: null;
				if (!target || target.classList.contains("is-hidden")) return;

				event.preventDefault();
				const headerHeight = appHeader
					? appHeader.getBoundingClientRect().height
					: 0;
				const top =
					window.scrollY +
					target.getBoundingClientRect().top -
					headerHeight -
					18;
				window.scrollTo({ top, behavior: "smooth" });
				setActiveTab(targetId);
			});
		});

		searchInput.addEventListener("input", filterEntries);

		window.addEventListener("resize", () => {
			updateHeaderOffset();
			syncActiveTab();
		});

		window.addEventListener("scroll", syncActiveTab, { passive: true });

		window.addEventListener("beforeunload", (event) => {
			if (getPendingCount() > 0 || editorState.activeEditor) {
				event.preventDefault();
				event.returnValue = "";
			}
		});

		window.addEventListener("keydown", (event) => {
			if (
				(event.ctrlKey || event.metaKey) &&
				event.key.toLowerCase() === "e"
			) {
				event.preventDefault();
				setEditMode(!editorState.isEditMode);
				return;
			}

			const activeElement = document.activeElement;
			const activeTag = activeElement?.tagName?.toLowerCase();
			const isTypingContext =
				activeElement &&
				(activeElement === searchInput ||
					activeElement.isContentEditable ||
					activeTag === "input" ||
					activeTag === "textarea" ||
					activeTag === "select");

			if (event.key === "/" && !isTypingContext) {
				event.preventDefault();
				searchInput.focus();
				searchInput.select();
			}
		});

		setEditMode(false);

		window.addEventListener("load", () => {
			updateHeaderOffset();
			filterEntries();
		});
	}

	const appShell = document.querySelector("[data-doc-id]");
	const docId = appShell ? appShell.getAttribute("data-doc-id") : "";
	const registry = window.DOC_DATA_REGISTRY || {};
	const docData = docId ? registry[docId] : null;

	if (docData) {
		renderFromData(docData);
	}

	initializeInteractions();
})();
