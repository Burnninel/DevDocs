"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const rootDir = path.resolve(__dirname, "..");
const dataDir = path.join(rootDir, "data");
const docsDir = path.join(rootDir, "docs");
const assetsJsDir = path.join(rootDir, "assets", "js");

const VALID_LAYOUTS = new Set(["single", "two"]);
const VALID_DESCRIPTION_TONES = new Set(["default", "warn"]);
const VALID_SPANS = new Set(["full"]);
const VALID_CALLOUT_TYPES = new Set(["hint", "warn", "danger"]);
const VALID_CONTENT_BLOCK_TYPES = new Set([
	"tech-list",
	"checklist-block",
	"comparison-block",
	"context-block",
	"flow-steps",
	"reference-card",
]);
const VALID_CONTEXT_BLOCK_VARIANTS = new Set([
	"attention",
	"tip",
	"good-practice",
	"common-error",
]);

const errors = [];
const warnings = [];

function rel(filePath) {
	return path.relative(rootDir, filePath).replace(/\\/g, "/");
}

function readUtf8(filePath) {
	return fs.readFileSync(filePath, "utf8");
}

function addError(message) {
	errors.push(message);
}

function addWarning(message) {
	warnings.push(message);
}

function ensure(condition, message) {
	if (!condition) addError(message);
}

function isObject(value) {
	return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
	return typeof value === "string" && value.trim().length > 0;
}

function normalizePathSlashes(value) {
	return String(value ?? "").replace(/\\/g, "/");
}

function compileJavascript(filePath) {
	try {
		new vm.Script(readUtf8(filePath), { filename: filePath });
	} catch (error) {
		addError(`[${rel(filePath)}] JS invalido: ${error.message}`);
	}
}

function executeBrowserScript(filePath, extraWindow = {}) {
	const sandbox = {
		window: { ...extraWindow },
		console: {
			log() {},
			warn() {},
			error() {},
		},
		setTimeout,
		clearTimeout,
	};

	sandbox.self = sandbox.window;
	sandbox.globalThis = sandbox;

	try {
		vm.runInNewContext(readUtf8(filePath), sandbox, {
			filename: filePath,
		});
		return sandbox.window;
	} catch (error) {
		addError(
			`[${rel(filePath)}] erro ao executar script: ${error.message}`,
		);
		return null;
	}
}

function extractHtmlAttribute(html, attributeName) {
	const pattern = new RegExp(`${attributeName}="([^"]+)"`, "i");
	const match = html.match(pattern);
	return match ? match[1].trim() : "";
}

function extractScriptSrcs(html) {
	return [
		...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/gi),
	].map((match) => match[1].trim());
}

function extractStylesheetHrefs(html) {
	return [
		...html.matchAll(
			/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/gi,
		),
	].map((match) => match[1].trim());
}

function isRedirectOnlyHtml(html) {
	return /<meta\s+http-equiv="refresh"\s+content="[^"]*url=\s*\.?\/?index\.html"/i.test(
		html,
	);
}

function validateCallout(callout, context) {
	if (callout == null) return;

	ensure(
		isObject(callout),
		`[${context}] callout deve ser um objeto quando informado.`,
	);

	if (!isObject(callout)) return;

	ensure(
		VALID_CALLOUT_TYPES.has(callout.type),
		`[${context}] callout.type invalido: ${String(callout.type)}.`,
	);
	ensure(
		isNonEmptyString(callout.label),
		`[${context}] callout.label obrigatorio.`,
	);
	ensure(
		isNonEmptyString(callout.text),
		`[${context}] callout.text obrigatorio.`,
	);
}

function validateQuickStart(quickStart, context) {
	if (quickStart == null) return;

	ensure(
		isObject(quickStart),
		`[${context}] quickStart deve ser um objeto quando informado.`,
	);

	if (!isObject(quickStart)) return;

	ensure(
		isNonEmptyString(quickStart.title),
		`[${context}] quickStart.title obrigatorio.`,
	);
	ensure(
		isNonEmptyString(quickStart.kicker),
		`[${context}] quickStart.kicker obrigatorio.`,
	);
	ensure(
		isNonEmptyString(quickStart.description),
		`[${context}] quickStart.description obrigatorio.`,
	);
	ensure(
		isNonEmptyString(quickStart.code),
		`[${context}] quickStart.code obrigatorio.`,
	);

	if (quickStart.codeLanguage != null) {
		ensure(
			isNonEmptyString(quickStart.codeLanguage),
			`[${context}] quickStart.codeLanguage deve ser texto quando informado.`,
		);
	}

	if (quickStart.steps != null) {
		ensure(
			Array.isArray(quickStart.steps),
			`[${context}] quickStart.steps deve ser um array quando informado.`,
		);

		if (Array.isArray(quickStart.steps)) {
			ensure(
				quickStart.steps.length > 0,
				`[${context}] quickStart.steps nao pode ser vazio.`,
			);

			quickStart.steps.forEach((step, index) => {
				ensure(
					isNonEmptyString(step),
					`[${context}] quickStart.steps.${index} deve ser texto nao vazio.`,
				);
			});
		}
	}

	validateCallout(quickStart.callout, `${context} > quickStart`);
}

function validateNonEmptyStringArray(values, context) {
	ensure(
		Array.isArray(values) && values.length > 0,
		`[${context}] deve ser um array nao vazio.`,
	);

	if (!Array.isArray(values)) return;

	values.forEach((value, index) => {
		ensure(
			isNonEmptyString(value),
			`[${context}] item ${index} deve ser texto nao vazio.`,
		);
	});
}

function validateContentBlock(block, context) {
	ensure(isObject(block), `[${context}] bloco deve ser um objeto.`);
	if (!isObject(block)) return;

	ensure(
		VALID_CONTENT_BLOCK_TYPES.has(block.type),
		`[${context}] type invalido: ${String(block.type)}.`,
	);

	if (!VALID_CONTENT_BLOCK_TYPES.has(block.type)) return;

	if (block.title != null) {
		ensure(
			isNonEmptyString(block.title),
			`[${context}] title deve ser texto nao vazio quando informado.`,
		);
	}

	if (block.type === "tech-list") {
		ensure(
			Array.isArray(block.items) && block.items.length > 0,
			`[${context}] items deve ser um array nao vazio.`,
		);

		if (Array.isArray(block.items)) {
			block.items.forEach((item, index) => {
				ensure(
					isObject(item),
					`[${context}] items.${index} deve ser um objeto.`,
				);
				if (!isObject(item)) return;
				ensure(
					isNonEmptyString(item.term),
					`[${context}] items.${index}.term obrigatorio.`,
				);
				ensure(
					isNonEmptyString(item.description),
					`[${context}] items.${index}.description obrigatorio.`,
				);
			});
		}
		return;
	}

	if (block.type === "checklist-block") {
		validateNonEmptyStringArray(block.items, `${context} > items`);
		return;
	}

	if (block.type === "comparison-block") {
		ensure(
			Array.isArray(block.columns) && block.columns.length === 2,
			`[${context}] columns deve ter exatamente 2 colunas.`,
		);

		if (Array.isArray(block.columns)) {
			block.columns.forEach((column, index) => {
				ensure(
					isObject(column),
					`[${context}] columns.${index} deve ser um objeto.`,
				);
				if (!isObject(column)) return;
				ensure(
					isNonEmptyString(column.title),
					`[${context}] columns.${index}.title obrigatorio.`,
				);

				if (column.description != null) {
					ensure(
						isNonEmptyString(column.description),
						`[${context}] columns.${index}.description deve ser texto nao vazio quando informado.`,
					);
				}

				if (column.items != null) {
					validateNonEmptyStringArray(
						column.items,
						`${context} > columns.${index}.items`,
					);
				}

				ensure(
					isNonEmptyString(column.description) ||
						(Array.isArray(column.items) &&
							column.items.length > 0),
					`[${context}] columns.${index} precisa de description ou items.`,
				);
			});
		}
		return;
	}

	if (block.type === "context-block") {
		ensure(
			VALID_CONTEXT_BLOCK_VARIANTS.has(block.variant),
			`[${context}] variant invalido: ${String(block.variant)}.`,
		);
		ensure(
			isNonEmptyString(block.text),
			`[${context}] text obrigatorio.`,
		);
		if (block.label != null) {
			ensure(
				isNonEmptyString(block.label),
				`[${context}] label deve ser texto nao vazio quando informado.`,
			);
		}
		return;
	}

	if (block.type === "flow-steps") {
		validateNonEmptyStringArray(block.steps, `${context} > steps`);
		return;
	}

	if (block.type === "reference-card") {
		if (block.description != null) {
			ensure(
				isNonEmptyString(block.description),
				`[${context}] description deve ser texto nao vazio quando informado.`,
			);
		}
		if (block.items != null) {
			validateNonEmptyStringArray(block.items, `${context} > items`);
		}
		ensure(
			isNonEmptyString(block.title) ||
				isNonEmptyString(block.description) ||
				(Array.isArray(block.items) && block.items.length > 0),
			`[${context}] reference-card precisa de title, description ou items.`,
		);
	}
}

function validateContentBlocks(blocks, context) {
	if (blocks == null) return;

	ensure(
		Array.isArray(blocks) && blocks.length > 0,
		`[${context}] contentBlocks deve ser um array nao vazio quando informado.`,
	);

	if (!Array.isArray(blocks)) return;

	blocks.forEach((block, index) => {
		validateContentBlock(block, `${context} > contentBlocks.${index}`);
	});
}

function validateEntry(entry, context) {
	ensure(isObject(entry), `[${context}] entry deve ser um objeto.`);
	if (!isObject(entry)) return;

	ensure(isNonEmptyString(entry.title), `[${context}] title obrigatorio.`);
	ensure(isNonEmptyString(entry.kicker), `[${context}] kicker obrigatorio.`);
	ensure(
		isNonEmptyString(entry.description),
		`[${context}] description obrigatorio.`,
	);
	const hasCode = isNonEmptyString(entry.code);
	const hasContentBlocks =
		Array.isArray(entry.contentBlocks) && entry.contentBlocks.length > 0;
	ensure(
		hasCode || hasContentBlocks,
		`[${context}] entry precisa ter code ou contentBlocks.`,
	);

	ensure(
		Array.isArray(entry.tags) && entry.tags.length > 0,
		`[${context}] tags deve ser um array nao vazio.`,
	);

	if (Array.isArray(entry.tags)) {
		const seenTags = new Set();
		entry.tags.forEach((tag, index) => {
			ensure(
				isNonEmptyString(tag),
				`[${context}] tags.${index} deve ser texto nao vazio.`,
			);

			const normalizedTag = String(tag).trim().toLowerCase();
			if (normalizedTag) {
				if (seenTags.has(normalizedTag)) {
					addWarning(`[${context}] tag duplicada: ${tag}.`);
				}
				seenTags.add(normalizedTag);
			}
		});
	}

	if (entry.descriptionTone != null) {
		ensure(
			VALID_DESCRIPTION_TONES.has(entry.descriptionTone),
			`[${context}] descriptionTone invalido: ${String(entry.descriptionTone)}.`,
		);
	}

	if (entry.span != null) {
		ensure(
			VALID_SPANS.has(entry.span),
			`[${context}] span invalido: ${String(entry.span)}.`,
		);
	}

	if (entry.codeLanguage != null) {
		ensure(
			isNonEmptyString(entry.codeLanguage),
			`[${context}] codeLanguage deve ser texto quando informado.`,
		);
	}

	if (entry.output != null) {
		ensure(
			isNonEmptyString(entry.output),
			`[${context}] output deve ser texto nao vazio quando informado.`,
		);
	}

	validateCallout(entry.callout, context);
	validateContentBlocks(entry.contentBlocks, context);
}

function validateSection(section, context, seenSectionIds) {
	ensure(isObject(section), `[${context}] secao deve ser um objeto.`);
	if (!isObject(section)) return;

	ensure(
		isNonEmptyString(section.id),
		`[${context}] section.id obrigatorio.`,
	);
	ensure(
		isNonEmptyString(section.name),
		`[${context}] section.name obrigatorio.`,
	);

	if (isNonEmptyString(section.id)) {
		if (seenSectionIds.has(section.id)) {
			addError(`[${context}] id de secao duplicado: ${section.id}.`);
		}
		seenSectionIds.add(section.id);
	}

	if (section.layout != null) {
		ensure(
			VALID_LAYOUTS.has(section.layout),
			`[${context}] layout invalido: ${String(section.layout)}.`,
		);
	}

	ensure(
		Array.isArray(section.entries) && section.entries.length > 0,
		`[${context}] entries deve ser um array nao vazio.`,
	);

	if (Array.isArray(section.entries)) {
		section.entries.forEach((entry, index) => {
			validateEntry(entry, `${context} > entry ${index + 1}`);
		});
	}
}

function validateDocObject(doc, registryId, sourceFile) {
	const context = `${rel(sourceFile)}:${registryId || "sem-id"}`;

	ensure(isObject(doc), `[${context}] documento deve ser um objeto.`);
	if (!isObject(doc)) return;

	ensure(isNonEmptyString(doc.id), `[${context}] id obrigatorio.`);
	ensure(isNonEmptyString(doc.title), `[${context}] title obrigatorio.`);
	ensure(
		isNonEmptyString(doc.subtitle),
		`[${context}] subtitle obrigatorio.`,
	);
	ensure(
		isNonEmptyString(doc.searchPlaceholder),
		`[${context}] searchPlaceholder obrigatorio.`,
	);
	ensure(
		isNonEmptyString(doc.shortcutHint),
		`[${context}] shortcutHint obrigatorio.`,
	);

	if (isNonEmptyString(doc.id) && registryId && doc.id !== registryId) {
		addError(
			`[${context}] doc.id (${doc.id}) diferente do id registrado no arquivo (${registryId}).`,
		);
	}

	if (doc.codeLanguage != null) {
		ensure(
			isNonEmptyString(doc.codeLanguage),
			`[${context}] codeLanguage deve ser texto quando informado.`,
		);
	}

	if (doc.defaultSectionLayout != null) {
		ensure(
			VALID_LAYOUTS.has(doc.defaultSectionLayout),
			`[${context}] defaultSectionLayout invalido: ${String(doc.defaultSectionLayout)}.`,
		);
	}

	validateQuickStart(doc.quickStart, context);

	ensure(
		Array.isArray(doc.sections) && doc.sections.length > 0,
		`[${context}] sections deve ser um array nao vazio.`,
	);

	if (Array.isArray(doc.sections)) {
		const seenSectionIds = new Set();
		doc.sections.forEach((section, index) => {
			validateSection(
				section,
				`${context} > secao ${index + 1}`,
				seenSectionIds,
			);
		});
	}
}

function loadDocDataFile(filePath) {
	const windowObject = executeBrowserScript(filePath, {
		DOC_DATA_REGISTRY: {},
	});
	if (!windowObject) return null;

	const registry = windowObject.DOC_DATA_REGISTRY;
	const registryKeys = isObject(registry) ? Object.keys(registry) : [];

	ensure(
		registryKeys.length === 1,
		`[${rel(filePath)}] o arquivo deve registrar exatamente 1 documento em window.DOC_DATA_REGISTRY.`,
	);

	if (registryKeys.length !== 1) return null;

	const registryId = registryKeys[0];
	const doc = registry[registryId];

	validateDocObject(doc, registryId, filePath);

	return { registryId, doc, filePath };
}

function loadManifest(filePath) {
	const windowObject = executeBrowserScript(filePath);
	if (!windowObject) return null;

	const manifest = windowObject.DOCS_MANIFEST;
	ensure(
		isObject(manifest),
		`[${rel(filePath)}] window.DOCS_MANIFEST deve ser um objeto.`,
	);

	if (!isObject(manifest)) return null;

	ensure(
		isNonEmptyString(manifest.title),
		`[${rel(filePath)}] manifest.title obrigatorio.`,
	);
	ensure(
		isNonEmptyString(manifest.subtitle),
		`[${rel(filePath)}] manifest.subtitle obrigatorio.`,
	);
	ensure(
		Array.isArray(manifest.docs) && manifest.docs.length > 0,
		`[${rel(filePath)}] manifest.docs deve ser um array nao vazio.`,
	);

	if (Array.isArray(manifest.docs)) {
		const seenIds = new Set();
		const seenHrefs = new Set();

		manifest.docs.forEach((entry, index) => {
			const context = `${rel(filePath)} > docs[${index}]`;
			ensure(isObject(entry), `[${context}] item deve ser um objeto.`);
			if (!isObject(entry)) return;

			ensure(isNonEmptyString(entry.id), `[${context}] id obrigatorio.`);
			ensure(
				isNonEmptyString(entry.title),
				`[${context}] title obrigatorio.`,
			);
			ensure(
				isNonEmptyString(entry.description),
				`[${context}] description obrigatorio.`,
			);
			ensure(
				isNonEmptyString(entry.href),
				`[${context}] href obrigatorio.`,
			);

			if (isNonEmptyString(entry.actionLabel) === false) {
				addWarning(
					`[${context}] actionLabel ausente; sera usado fallback visual.`,
				);
			}

			if (isNonEmptyString(entry.id)) {
				if (seenIds.has(entry.id)) {
					addError(
						`[${context}] id duplicado no manifesto: ${entry.id}.`,
					);
				}
				seenIds.add(entry.id);
			}

			if (isNonEmptyString(entry.href)) {
				const normalizedHref = normalizePathSlashes(entry.href);
				if (seenHrefs.has(normalizedHref)) {
					addError(
						`[${context}] href duplicado no manifesto: ${entry.href}.`,
					);
				}
				seenHrefs.add(normalizedHref);
			}
		});
	}

	return manifest;
}

function validateDocHtmlFile(filePath, expectedDocId, expectedDataScript) {
	const html = readUtf8(filePath);
	const scripts = extractScriptSrcs(html);
	const stylesheets = extractStylesheetHrefs(html);
	const dataDocId = extractHtmlAttribute(html, "data-doc-id");
	const context = rel(filePath);

	ensure(
		isNonEmptyString(dataDocId),
		`[${context}] data-doc-id obrigatorio na app-shell.`,
	);

	if (expectedDocId) {
		ensure(
			dataDocId === expectedDocId,
			`[${context}] data-doc-id (${dataDocId || "vazio"}) diferente do esperado (${expectedDocId}).`,
		);
	}

	ensure(
		stylesheets.includes("../assets/css/docs-theme.css"),
		`[${context}] deve carregar ../assets/css/docs-theme.css.`,
	);
	ensure(
		scripts.includes("../assets/js/docs-core.js"),
		`[${context}] deve carregar ../assets/js/docs-core.js.`,
	);

	if (expectedDataScript) {
		ensure(
			scripts.includes(expectedDataScript),
			`[${context}] deve carregar ${expectedDataScript}.`,
		);
	}
}

function validateHubHtml(filePath) {
	const html = readUtf8(filePath);
	const scripts = extractScriptSrcs(html);
	const stylesheets = extractStylesheetHrefs(html);
	const context = rel(filePath);

	ensure(
		stylesheets.includes("./assets/css/docs-hub.css"),
		`[${context}] deve carregar ./assets/css/docs-hub.css.`,
	);
	ensure(
		scripts.includes("./data/docs-manifest.data.js"),
		`[${context}] deve carregar ./data/docs-manifest.data.js.`,
	);
	ensure(
		scripts.includes("./assets/js/docs-hub.js"),
		`[${context}] deve carregar ./assets/js/docs-hub.js.`,
	);
}

function main() {
	["docs-core.js", "docs-hub.js"].forEach((fileName) => {
		compileJavascript(path.join(assetsJsDir, fileName));
	});

	const manifestPath = path.join(dataDir, "docs-manifest.data.js");
	const templateDataPath = path.join(dataDir, "_template.data.js");
	const templateHtmlPath = path.join(docsDir, "_template.html");
	const indexHtmlPath = path.join(rootDir, "index.html");

	const manifest = loadManifest(manifestPath);
	const templateDoc = loadDocDataFile(templateDataPath);

	if (templateDoc) {
		validateDocHtmlFile(
			templateHtmlPath,
			templateDoc.registryId,
			"../data/_template.data.js",
		);
	}

	validateHubHtml(indexHtmlPath);

	const dataFiles = fs
		.readdirSync(dataDir)
		.filter(
			(fileName) =>
				fileName.endsWith(".data.js") &&
				fileName !== "docs-manifest.data.js" &&
				fileName !== "_template.data.js",
		)
		.sort();

	const docsFromData = new Map();

	dataFiles.forEach((fileName) => {
		const filePath = path.join(dataDir, fileName);
		const loadedDoc = loadDocDataFile(filePath);
		if (loadedDoc) {
			docsFromData.set(loadedDoc.registryId, loadedDoc);
		}
	});

	const docHtmlFiles = fs
		.readdirSync(docsDir)
		.filter(
			(fileName) =>
				fileName.endsWith(".html") && fileName !== "_template.html",
		)
		.sort();

	const docIdsFromHtml = new Set();

	docHtmlFiles.forEach((fileName) => {
		const filePath = path.join(docsDir, fileName);
		const html = readUtf8(filePath);
		const docId = extractHtmlAttribute(html, "data-doc-id");
		const normalizedDocId = isNonEmptyString(docId) ? docId : "";

		if (normalizedDocId) {
			docIdsFromHtml.add(normalizedDocId);
			validateDocHtmlFile(
				filePath,
				normalizedDocId,
				`../data/${normalizedDocId}.data.js`,
			);
		} else {
			validateDocHtmlFile(filePath, null, null);
		}
	});

	if (manifest && Array.isArray(manifest.docs)) {
		const manifestIds = new Set();

		manifest.docs.forEach((entry) => {
			if (
				!isObject(entry) ||
				!isNonEmptyString(entry.id) ||
				!isNonEmptyString(entry.href)
			) {
				return;
			}

			manifestIds.add(entry.id);

			const htmlPath = path.resolve(rootDir, entry.href);
			ensure(
				fs.existsSync(htmlPath),
				`[data/docs-manifest.data.js] href nao encontrado para '${entry.id}': ${entry.href}.`,
			);

			const dataDoc = docsFromData.get(entry.id);
			ensure(
				Boolean(dataDoc),
				`[data/docs-manifest.data.js] documento '${entry.id}' nao possui data file correspondente.`,
			);

			if (fs.existsSync(htmlPath)) {
				validateDocHtmlFile(
					htmlPath,
					entry.id,
					`../data/${entry.id}.data.js`,
				);
			}
		});

		docsFromData.forEach((loadedDoc, docId) => {
			if (!manifestIds.has(docId)) {
				addError(
					`[${rel(loadedDoc.filePath)}] documento '${docId}' nao esta registrado em data/docs-manifest.data.js.`,
				);
			}
		});

		docIdsFromHtml.forEach((docId) => {
			if (!manifestIds.has(docId)) {
				addError(
					`[docs/${docId}.html] data-doc-id '${docId}' nao esta registrado em data/docs-manifest.data.js.`,
				);
			}
		});
	}

	const rootHtmlWarnings = fs
		.readdirSync(rootDir)
		.filter(
			(fileName) =>
				fileName.toLowerCase().endsWith(".html") &&
				fileName.toLowerCase() !== "index.html",
		);

	rootHtmlWarnings.forEach((fileName) => {
		const html = readUtf8(path.join(rootDir, fileName));
		if (isRedirectOnlyHtml(html)) {
			return;
		}

		addWarning(
			`[${fileName}] arquivo HTML fora de docs/ detectado na raiz. Confirme se ele ainda faz parte do fluxo oficial.`,
		);
	});

	if (errors.length > 0) {
		console.error("Falhas de validacao encontradas:");
		errors.forEach((message) => console.error(` - ${message}`));

		if (warnings.length > 0) {
			console.warn("");
			console.warn("Avisos:");
			warnings.forEach((message) => console.warn(` - ${message}`));
		}

		process.exit(1);
	}

	console.log(
		`Validacao concluida com sucesso para ${docsFromData.size} documentacao(oes), 1 template e 1 manifesto.`,
	);

	if (warnings.length > 0) {
		console.warn("");
		console.warn("Avisos:");
		warnings.forEach((message) => console.warn(` - ${message}`));
	}
}

main();
