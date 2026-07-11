// @ts-check
/**
 * Migração de conteúdo: legado `data/*.data.js` -> `src/content/docs/*.yaml`.
 *
 * Estratégia (verificável, zero perda):
 *   1. Avalia cada data file numa sandbox `vm` com um `window` falso e captura
 *      `window.DOC_DATA_REGISTRY[slug]`.
 *   2. Deriva `tech` (prefixo do slug) e `order` (índice no manifesto) e injeta
 *      `cardDescription` (blurb do manifesto).
 *   3. Serializa para YAML (block scalars preservam código sem escape).
 *   4. Round-trip: reparse do YAML e deep-equal contra o objeto transformado.
 *   5. Relatório de fidelidade: contagens de sections/entries/callouts/blocks.
 *
 * Uso: `node scripts/migrate-content.mjs`
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import vm from "node:vm";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DATA_DIR = join(ROOT, "data");
const OUT_DIR = join(ROOT, "src", "content", "docs");

/** Deriva a tecnologia a partir do slug. */
function techFromSlug(slug) {
	if (slug.startsWith("php-")) return "php";
	if (slug.startsWith("go-")) return "go";
	if (slug === "git-github-terminal" || slug.startsWith("git-")) return "git";
	if (slug.startsWith("vue-")) return "vue";
	throw new Error(`Não consegui derivar a tech do slug "${slug}"`);
}

/** Avalia um data file legado e devolve o objeto exportado no registry. */
function evalDataFile(filePath) {
	const source = readFileSync(filePath, "utf8");
	const sandbox = { window: {} };
	vm.createContext(sandbox);
	vm.runInContext(source, sandbox, { filename: filePath });
	return sandbox;
}

/** Lê o manifesto -> ordem canônica + blurb do card por slug. */
function readManifest() {
	const sandbox = evalDataFile(join(DATA_DIR, "docs-manifest.data.js"));
	const docs = sandbox.window?.DOCS_MANIFEST?.docs ?? [];
	const order = new Map();
	const cardDescription = new Map();
	docs.forEach((doc, index) => {
		order.set(doc.id, index);
		if (doc.description) cardDescription.set(doc.id, doc.description);
	});
	return { order, cardDescription, count: docs.length };
}

/** Contagens estruturais para o relatório de fidelidade. */
function countStructure(doc) {
	let entries = 0;
	let callouts = 0;
	let blocks = 0;
	let code = 0;
	if (doc.quickStart) {
		if (doc.quickStart.callout) callouts += 1;
		if (doc.quickStart.code) code += 1;
	}
	for (const section of doc.sections ?? []) {
		for (const entry of section.entries ?? []) {
			entries += 1;
			if (entry.callout) callouts += 1;
			if (entry.code) code += 1;
			blocks += (entry.contentBlocks ?? []).length;
		}
	}
	return { sections: (doc.sections ?? []).length, entries, callouts, blocks, code };
}

function eqCounts(a, b) {
	return (
		a.sections === b.sections &&
		a.entries === b.entries &&
		a.callouts === b.callouts &&
		a.blocks === b.blocks &&
		a.code === b.code
	);
}

function main() {
	mkdirSync(OUT_DIR, { recursive: true });

	const manifest = readManifest();
	const files = readdirSync(DATA_DIR)
		.filter((f) => f.endsWith(".data.js"))
		.filter((f) => f !== "docs-manifest.data.js" && f !== "_template.data.js");

	const report = [];
	let failures = 0;

	for (const file of files) {
		const slug = file.replace(/\.data\.js$/, "");
		const sandbox = evalDataFile(join(DATA_DIR, file));
		const registry = sandbox.window?.DOC_DATA_REGISTRY ?? {};
		const source = registry[slug] ?? Object.values(registry)[0];

		if (!source) {
			console.error(`✗ ${slug}: nenhum documento no registry`);
			failures += 1;
			continue;
		}

		// Objeto transformado: conteúdo original + derivados.
		const transformed = {
			...source,
			id: source.id ?? slug,
			tech: techFromSlug(slug),
			order: manifest.order.has(slug) ? manifest.order.get(slug) : 999,
		};
		const card = manifest.cardDescription.get(slug);
		if (card) transformed.cardDescription = card;

		// version: "1.1" alinha o stringifier ao parser YAML 1.1 do loader do
		// Astro: valores ambíguos (datas ISO, yes/no/on/off, null-like) são
		// auto-citados para permanecerem strings em qualquer parser.
		const yamlText = stringifyYaml(transformed, {
			lineWidth: 0,
			blockQuote: "literal",
			version: "1.1",
		});
		const outPath = join(OUT_DIR, `${slug}.yaml`);
		writeFileSync(outPath, yamlText, "utf8");

		// Round-trip: garante que o YAML reparse é idêntico ao transformado.
		const roundtrip = parseYaml(yamlText);
		const roundtripOk =
			JSON.stringify(roundtrip) === JSON.stringify(transformed);

		const before = countStructure(source);
		const after = countStructure(roundtrip);
		const countsOk = eqCounts(before, after);

		if (!roundtripOk || !countsOk) failures += 1;

		report.push({ slug, tech: transformed.tech, before, roundtripOk, countsOk });
	}

	// Relatório
	report.sort((a, b) => a.tech.localeCompare(b.tech) || a.slug.localeCompare(b.slug));
	console.log("\n=== Relatório de fidelidade da migração ===\n");
	console.log(
		"slug".padEnd(30) +
			"tech".padEnd(6) +
			"secs".padEnd(6) +
			"entries".padEnd(9) +
			"callouts".padEnd(10) +
			"blocks".padEnd(8) +
			"code".padEnd(6) +
			"rt".padEnd(4) +
			"cnt",
	);
	for (const r of report) {
		console.log(
			r.slug.padEnd(30) +
				r.tech.padEnd(6) +
				String(r.before.sections).padEnd(6) +
				String(r.before.entries).padEnd(9) +
				String(r.before.callouts).padEnd(10) +
				String(r.before.blocks).padEnd(8) +
				String(r.before.code).padEnd(6) +
				(r.roundtripOk ? "ok" : "!!").padEnd(4) +
				(r.countsOk ? "ok" : "!!"),
		);
	}

	const totals = report.reduce(
		(acc, r) => {
			acc.sections += r.before.sections;
			acc.entries += r.before.entries;
			acc.callouts += r.before.callouts;
			acc.blocks += r.before.blocks;
			acc.code += r.before.code;
			return acc;
		},
		{ sections: 0, entries: 0, callouts: 0, blocks: 0, code: 0 },
	);

	console.log("\n---");
	console.log(
		`Docs migradas: ${report.length}/${files.length} · Manifesto: ${manifest.count} docs`,
	);
	console.log(
		`Totais: ${totals.sections} seções · ${totals.entries} entries · ${totals.callouts} callouts · ${totals.blocks} content-blocks · ${totals.code} blocos de código`,
	);

	if (failures > 0) {
		console.error(`\n✗ ${failures} doc(s) falharam na verificação de fidelidade.`);
		process.exit(1);
	}
	console.log("\n✓ Migração concluída com fidelidade verificada (round-trip + contagens).\n");
}

main();
