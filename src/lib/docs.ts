/**
 * Camada de acesso ao conteúdo: consulta a coleção `docs`, agrupa por
 * tecnologia e expõe metadados de cada tech (rótulo, ícone, tagline).
 * Isola os componentes visuais da forma de armazenamento do conteúdo.
 */
import { getCollection, type CollectionEntry } from "astro:content";
import { TECHS, type Tech } from "@/content.config";

export type DocEntry = CollectionEntry<"docs">;

export interface TechMeta {
	label: string;
	/** Rótulo curto para breadcrumbs/chips. */
	short: string;
	tagline: string;
	/** Ícone Iconify (astro-icon). */
	icon: string;
}

export const TECH_META: Record<Tech, TechMeta> = {
	php: {
		label: "PHP",
		short: "PHP",
		tagline: "Do dia a dia ao back-end: dados, APIs, sessões e segurança.",
		icon: "simple-icons:php",
	},
	go: {
		label: "Go",
		short: "Go",
		tagline: "Fundamentos idiomáticos, concorrência e biblioteca padrão.",
		icon: "simple-icons:go",
	},
	git: {
		label: "Git & GitHub",
		short: "Git",
		tagline: "Fluxo de terminal, branches e desfazer com confiança.",
		icon: "simple-icons:git",
	},
	vue: {
		label: "Vue",
		short: "Vue",
		tagline: "Componentes, reatividade e composição — em breve.",
		icon: "simple-icons:vuedotjs",
	},
	arquitetura: {
		label: "Arquitetura",
		short: "Arq",
		tagline: "Padrões, camadas e decisões de estrutura — independentes de linguagem.",
		icon: "lucide:layers",
	},
};

/** Ordem de exibição das tecnologias na home. */
export const TECH_ORDER: Tech[] = ["php", "go", "arquitetura", "git", "vue"];

function byOrder(a: DocEntry, b: DocEntry): number {
	return (a.data.order ?? 0) - (b.data.order ?? 0);
}

/** Todas as docs, ordenadas pelo `order` do manifesto. */
export async function getAllDocs(): Promise<DocEntry[]> {
	const docs = await getCollection("docs");
	return docs.sort(byOrder);
}

/** Docs de uma tecnologia, ordenadas. */
export async function getDocsByTech(tech: Tech): Promise<DocEntry[]> {
	const docs = await getCollection("docs", (d) => d.data.tech === tech);
	return docs.sort(byOrder);
}

/** Mapa tech -> docs (apenas techs com ao menos uma doc). */
export async function getDocsGroupedByTech(): Promise<
	{ tech: Tech; meta: TechMeta; docs: DocEntry[] }[]
> {
	const all = await getAllDocs();
	const groups: { tech: Tech; meta: TechMeta; docs: DocEntry[] }[] = [];
	for (const tech of TECH_ORDER) {
		const docs = all.filter((d) => d.data.tech === tech);
		if (docs.length > 0) {
			groups.push({ tech, meta: TECH_META[tech], docs });
		}
	}
	return groups;
}

/** Techs válidas (type guard). */
export function isTech(value: string): value is Tech {
	return (TECHS as readonly string[]).includes(value);
}
