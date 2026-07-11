/**
 * Interação do explorador de arquitetura (`ArchitectureExplorer.astro`):
 * clicar numa camada em qualquer vista (diagrama, árvore ou card) destaca todas
 * as peças da mesma camada nas três vistas e esmaece o resto. Clicar de novo na
 * mesma camada limpa a seleção.
 *
 * Progressive enhancement: sem JS o bloco fica estático e totalmente visível
 * (indexável pelo Pagefind). Reinicializa a cada `astro:page-load`.
 */

function setupArchExplorers(): void {
	const explorers = Array.from(
		document.querySelectorAll<HTMLElement>("[data-arch-explorer]"),
	);

	for (const explorer of explorers) {
		const triggers = Array.from(
			explorer.querySelectorAll<HTMLElement>("[data-arch-trigger]"),
		);
		const nodes = Array.from(
			explorer.querySelectorAll<HTMLElement>("[data-arch-node]"),
		);
		if (triggers.length === 0) continue;

		let selected: string | null = null;

		function apply(): void {
			explorer.classList.toggle("has-selection", selected !== null);
			for (const node of nodes) {
				node.classList.toggle(
					"is-active",
					selected !== null && node.dataset.archLayer === selected,
				);
			}
			for (const trigger of triggers) {
				trigger.setAttribute(
					"aria-pressed",
					selected !== null && trigger.dataset.archLayer === selected
						? "true"
						: "false",
				);
			}
		}

		for (const trigger of triggers) {
			trigger.addEventListener("click", () => {
				const layer = trigger.dataset.archLayer ?? null;
				selected = selected === layer ? null : layer;
				apply();
			});
		}
	}
}

document.addEventListener("astro:page-load", setupArchExplorers);
