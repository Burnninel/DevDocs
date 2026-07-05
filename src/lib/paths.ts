/**
 * Helpers de rota conscientes do `base` do GitHub Pages (`/DevDocs`).
 * Astro NÃO prefixa `base` em hrefs arbitrários — use sempre estes helpers.
 */
import type { Tech } from "@/content.config";

/** BASE_URL termina com "/" (ex.: "/DevDocs/"). */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

/** Prefixa um caminho absoluto do site com o base. `withBase("/php/")`. */
export function withBase(path = "/"): string {
	const clean = path.startsWith("/") ? path : `/${path}`;
	return `${BASE}${clean}` || "/";
}

/** Parâmetro `[doc]` da rota = slug sem o prefixo da tecnologia. */
export function docParam(slug: string, tech: Tech): string {
	return slug.startsWith(`${tech}-`) ? slug.slice(tech.length + 1) : slug;
}

/** URL de uma tecnologia: `/DevDocs/php/`. */
export function techUrl(tech: Tech): string {
	return withBase(`/${tech}/`);
}

/** URL de uma doc: `/DevDocs/php/arrays/`, opcionalmente com âncora de seção. */
export function docUrl(tech: Tech, slug: string, sectionId?: string): string {
	const base = withBase(`/${tech}/${docParam(slug, tech)}/`);
	return sectionId ? `${base}#${sectionId}` : base;
}
