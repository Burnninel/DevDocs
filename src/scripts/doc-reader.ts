/**
 * Controlador da experiência de leitura de uma doc (progressive enhancement,
 * zero hidratação no caminho crítico de leitura):
 *  - troca de seção sem recarregar a página e sem rolar por tudo;
 *  - sincroniza a URL por hash + deep-link + botão voltar;
 *  - barra de progresso de leitura;
 *  - botões de copiar código.
 *
 * Reinicializa a cada `astro:page-load` (View Transitions do ClientRouter).
 * Todos os listeners de elemento são recriados a cada init (o DOM é trocado);
 * listeners globais são registrados uma única vez.
 */

let globalsBound = false;
let currentActivate: ((id: string, opts?: { push?: boolean }) => void) | null =
	null;

function setupDocReader(): void {
	const panels = Array.from(
		document.querySelectorAll<HTMLElement>("[data-section-panel]"),
	);
	if (panels.length === 0) {
		currentActivate = null;
		return;
	}
	// Gate de progressive enhancement: só com JS escondemos as seções inativas.
	// No HTML estático todas ficam visíveis (no-JS + indexação Pagefind).
	document.documentElement.classList.add("reader-js");

	const navLinks = Array.from(
		document.querySelectorAll<HTMLElement>("[data-section-link]"),
	);
	const ids = panels.map((p) => p.dataset.sectionPanel ?? "");
	const progressBar =
		document.querySelector<HTMLElement>("[data-progress-bar]");
	const scrollAnchor =
		document.querySelector<HTMLElement>("[data-doc-top]") ?? null;

	function setActive(id: string, opts: { push?: boolean } = {}): void {
		const target = ids.includes(id) ? id : ids[0];

		for (const panel of panels) {
			const isActive = panel.dataset.sectionPanel === target;
			// Visibilidade via classe (.reader-js gate no CSS), não `hidden`,
			// para não afetar a indexação estática do Pagefind.
			panel.classList.toggle("is-active", isActive);
		}
		for (const link of navLinks) {
			const isActive = link.dataset.sectionLink === target;
			link.toggleAttribute("data-active", isActive);
			if (isActive) link.setAttribute("aria-current", "true");
			else link.removeAttribute("aria-current");
		}

		updatePager(target);

		if (opts.push !== false) {
			const url = `${location.pathname}${location.search}#${target}`;
			if (`#${target}` !== location.hash) {
				history.pushState({ section: target }, "", url);
			}
		}
		updateProgress();
	}

	function updatePager(activeId: string): void {
		const index = ids.indexOf(activeId);
		const prev = document.querySelector<HTMLElement>("[data-pager-prev]");
		const next = document.querySelector<HTMLElement>("[data-pager-next]");
		setPagerLink(prev, ids[index - 1], panels[index - 1]);
		setPagerLink(next, ids[index + 1], panels[index + 1]);
	}

	function setPagerLink(
		el: HTMLElement | null,
		id: string | undefined,
		panel: HTMLElement | undefined,
	): void {
		if (!el) return;
		if (!id) {
			el.hidden = true;
			return;
		}
		el.hidden = false;
		el.dataset.sectionLink = id;
		const label = el.querySelector<HTMLElement>("[data-pager-label]");
		if (label && panel) label.textContent = panel.dataset.sectionName ?? id;
	}

	function updateProgress(): void {
		if (!progressBar) return;
		const doc = document.documentElement;
		const max = doc.scrollHeight - doc.clientHeight;
		const ratio = max > 0 ? Math.min(1, doc.scrollTop / max) : 0;
		progressBar.style.transform = `scaleX(${ratio})`;
	}

	// Cliques de navegação de seção (nav lateral e pager).
	for (const link of [
		...navLinks,
		...Array.from(
			document.querySelectorAll<HTMLElement>("[data-pager-prev],[data-pager-next]"),
		),
	]) {
		link.addEventListener("click", (event) => {
			const id = (event.currentTarget as HTMLElement).dataset.sectionLink;
			if (!id) return;
			event.preventDefault();
			setActive(id);
			scrollAnchor?.scrollIntoView({ block: "start", behavior: "auto" });
		});
	}

	// Botões de copiar.
	for (const btn of Array.from(
		document.querySelectorAll<HTMLElement>("[data-copy]"),
	)) {
		btn.addEventListener("click", async () => {
			const block = btn.closest("[data-code-block]");
			const code = block?.querySelector("pre")?.textContent ?? "";
			try {
				await navigator.clipboard.writeText(code);
				flashCopied(btn);
			} catch {
				/* clipboard indisponível (ex.: file://) — silencioso */
			}
		});
	}

	currentActivate = setActive;

	// Deep-link inicial pela hash, senão a primeira seção.
	const initial = location.hash.replace(/^#/, "");
	setActive(initial || ids[0], { push: false });

	// Listeners globais uma única vez (persistem entre navegações).
	if (!globalsBound) {
		globalsBound = true;
		window.addEventListener("popstate", () => {
			const id = location.hash.replace(/^#/, "");
			currentActivate?.(id || "", { push: false });
		});
		// Deep-link para a mesma página (ex.: resultado da busca com âncora de seção).
		window.addEventListener("hashchange", () => {
			const id = location.hash.replace(/^#/, "");
			if (id) currentActivate?.(id, { push: false });
		});
		window.addEventListener(
			"scroll",
			() => {
				const bar =
					document.querySelector<HTMLElement>("[data-progress-bar]");
				if (!bar) return;
				const doc = document.documentElement;
				const max = doc.scrollHeight - doc.clientHeight;
				const ratio = max > 0 ? Math.min(1, doc.scrollTop / max) : 0;
				bar.style.transform = `scaleX(${ratio})`;
			},
			{ passive: true },
		);
	}
}

function flashCopied(btn: HTMLElement): void {
	const idle = btn.querySelector<HTMLElement>("[data-copy-idle]");
	const done = btn.querySelector<HTMLElement>("[data-copy-done]");
	const label = btn.querySelector<HTMLElement>("[data-copy-label]");
	idle?.classList.add("hidden");
	done?.classList.remove("hidden");
	if (label) label.textContent = "copiado";
	window.setTimeout(() => {
		idle?.classList.remove("hidden");
		done?.classList.add("hidden");
		if (label) label.textContent = "copiar";
	}, 1600);
}

document.addEventListener("astro:page-load", setupDocReader);
