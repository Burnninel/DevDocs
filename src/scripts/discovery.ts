/**
 * Zona de descoberta (home + landings de tecnologia): revelações no scroll
 * (GSAP + ScrollTrigger). Movimento contido, respeitoso ao ritmo de leitura.
 *
 * Regras:
 *  - Só roda na zona "discovery" (`<html data-zone>`); a zona de leitura usa
 *    scroll nativo e não tem storytelling.
 *  - `prefers-reduced-motion: reduce` (ou ausência de JS) mantém tudo visível:
 *    `[data-reveal]` só é pré-ocultado quando a animação está ativa
 *    (classe `.discovery-anim`).
 *  - Rede de segurança: nenhum conteúdo pode ficar preso invisível — elementos
 *    já na viewport são revelados de imediato e há um fallback por timeout.
 *  - Reinicializa a cada `astro:page-load` (ClientRouter).
 *
 * Nota de decisão: NÃO usamos Lenis (smooth scroll). Ele sequestra a posição
 * de scroll e conflita com o deep-link por hash das seções — que é central na
 * navegação das docs — além de complicar a restauração de scroll. Ver
 * TECH_DECISIONS.md.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let fallbackTimer = 0;

function reduceMotion(): boolean {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function revealNow(el: Element): void {
	gsap.to(el, {
		opacity: 1,
		y: 0,
		duration: 0.7,
		ease: "power3.out",
		overwrite: "auto",
	});
}

function teardown(): void {
	ScrollTrigger.getAll().forEach((t) => t.kill());
	window.clearTimeout(fallbackTimer);
	document.documentElement.classList.remove("discovery-anim");
}

function setupDiscovery(): void {
	teardown();

	const isDiscovery = document.documentElement.dataset.zone === "discovery";
	const els = Array.from(
		document.querySelectorAll<HTMLElement>("[data-reveal]"),
	);
	if (!isDiscovery || els.length === 0) return;

	if (reduceMotion()) {
		// Sem movimento: garante visibilidade total.
		gsap.set(els, { clearProps: "all" });
		return;
	}

	document.documentElement.classList.add("discovery-anim");

	els.forEach((el) => {
		ScrollTrigger.create({
			trigger: el,
			start: "top 90%",
			once: true,
			onEnter: () => revealNow(el),
		});
		// Já visível na carga (ou acima da dobra): revela de imediato.
		if (el.getBoundingClientRect().top < window.innerHeight * 0.9) {
			revealNow(el);
		}
	});

	ScrollTrigger.refresh();

	// Rede de segurança: se algo escapar (jump, resize, bug), tudo aparece.
	fallbackTimer = window.setTimeout(() => {
		els.forEach((el) => {
			if (getComputedStyle(el).opacity === "0") revealNow(el);
		});
	}, 2500);
}

document.addEventListener("astro:page-load", setupDiscovery);
document.addEventListener("astro:after-swap", () => ScrollTrigger.refresh());
