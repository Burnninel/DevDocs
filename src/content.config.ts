import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/**
 * Schema da coleção de documentações.
 *
 * Espelha fielmente o formato legado `window.DOC_DATA_REGISTRY[slug]`
 * (ver `assets/js/docs-core.js` e `data/*.data.js`), acrescido de dois campos
 * derivados na migração: `tech` (para agrupar na home) e `order` (ordenação).
 *
 * Fonte única do tipo TypeScript do conteúdo — nada de layout aqui.
 */

const calloutSchema = z.object({
	type: z.enum(["hint", "warn", "danger"]),
	label: z.string(),
	text: z.string(),
});
export type Callout = z.infer<typeof calloutSchema>;

// --- Content blocks (union discriminada por `type`) ---------------------------

const referenceCardBlock = z.object({
	type: z.literal("reference-card"),
	title: z.string().optional(),
	description: z.string().optional(),
	items: z.array(z.string()).optional(),
});

const techListBlock = z.object({
	type: z.literal("tech-list"),
	title: z.string().optional(),
	termHeader: z.string().optional(),
	descriptionHeader: z.string().optional(),
	items: z.array(
		z.object({
			term: z.string(),
			description: z.string(),
		}),
	),
});

const checklistBlock = z.object({
	type: z.literal("checklist-block"),
	title: z.string().optional(),
	items: z.array(z.string()),
});

const comparisonBlock = z.object({
	type: z.literal("comparison-block"),
	title: z.string().optional(),
	columns: z.array(
		z.object({
			title: z.string().optional(),
			description: z.string().optional(),
			items: z.array(z.string()).optional(),
		}),
	),
});

const contextBlock = z.object({
	type: z.literal("context-block"),
	title: z.string().optional(),
	variant: z
		.enum(["good-practice", "common-error", "attention", "tip"])
		.optional(),
	label: z.string().optional(),
	text: z.string().optional(),
});

const flowStepsBlock = z.object({
	type: z.literal("flow-steps"),
	title: z.string().optional(),
	steps: z.array(z.string()),
});

const contentBlockSchema = z.discriminatedUnion("type", [
	referenceCardBlock,
	techListBlock,
	checklistBlock,
	comparisonBlock,
	contextBlock,
	flowStepsBlock,
]);
export type ContentBlock = z.infer<typeof contentBlockSchema>;

// --- Entry / Section / Doc ----------------------------------------------------

const entrySchema = z.object({
	title: z.string(),
	kicker: z.string().optional(),
	description: z.string().optional(),
	descriptionTone: z.enum(["default", "warn"]).optional(),
	code: z.string().optional(),
	codeLanguage: z.string().optional(),
	output: z.string().optional(),
	span: z.literal("full").optional(),
	tags: z.array(z.string()).default([]),
	callout: calloutSchema.optional(),
	contentBlocks: z.array(contentBlockSchema).optional(),
	/** Permite executar este código no navegador (php-wasm). Opt-in/opt-out por entry. */
	runnable: z.boolean().optional(),
});
export type DocEntry = z.infer<typeof entrySchema>;

const sectionSchema = z.object({
	id: z.string(),
	name: z.string(),
	layout: z.enum(["single", "two"]).optional(),
	entries: z.array(entrySchema),
});
export type DocSection = z.infer<typeof sectionSchema>;

const quickStartSchema = z.object({
	title: z.string(),
	kicker: z.string().optional(),
	description: z.string().optional(),
	steps: z.array(z.string()).optional(),
	codeLanguage: z.string().optional(),
	code: z.string().optional(),
	callout: calloutSchema.optional(),
});
export type QuickStart = z.infer<typeof quickStartSchema>;

/** Tecnologias suportadas. `vue` fica pronto para conteúdo futuro. */
export const TECHS = ["git", "php", "go", "vue"] as const;
export type Tech = (typeof TECHS)[number];

const docs = defineCollection({
	loader: glob({ pattern: "**/*.yaml", base: "./src/content/docs" }),
	schema: z.object({
		id: z.string(),
		title: z.string(),
		subtitle: z.string().optional(),
		/** Blurb curto do card na home (migrado do `docs-manifest`). */
		cardDescription: z.string().optional(),
		searchPlaceholder: z.string().optional(),
		shortcutHint: z.string().optional(),
		codeLanguage: z.string().optional(),
		defaultSectionLayout: z.enum(["single", "two"]).optional(),
		/** Valor padrão de `runnable` para as entries desta doc (sobrescrevível por entry). */
		defaultRunnable: z.boolean().optional(),
		quickStart: quickStartSchema.optional(),
		sections: z.array(sectionSchema),
		// derivados na migração:
		tech: z.enum(TECHS),
		order: z.number().default(0),
	}),
});

export const collections = { docs };
