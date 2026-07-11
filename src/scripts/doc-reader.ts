/**
 * Controlador da experiência de leitura de uma doc (progressive enhancement,
 * zero hidratação no caminho crítico de leitura):
 *  - modo `panels`: troca de seção sem recarregar e sem rolar por tudo;
 *  - modo `narrative`: capítulos empilhados + índice com scroll-spy;
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
/** Linguagem escolhida nas abas de código, sincronizada entre blocos e páginas. */
let preferredLang: string | null = null;

type ReaderMode = "panels" | "narrative";

const READER_MODE_STORAGE_KEY = "devdocs:reader-mode";

function isReaderMode(value: string | null | undefined): value is ReaderMode {
	return value === "panels" || value === "narrative";
}

function readStoredReaderMode(): ReaderMode | null {
	try {
		const value = window.localStorage.getItem(READER_MODE_STORAGE_KEY);
		return isReaderMode(value) ? value : null;
	} catch {
		return null;
	}
}

function storeReaderMode(mode: ReaderMode): void {
	try {
		window.localStorage.setItem(READER_MODE_STORAGE_KEY, mode);
	} catch {
		/* localStorage pode estar bloqueado — a preferência só não persiste. */
	}
}

/**
 * Abas de código multilíngue (`CodeTabs.astro`): trocar a linguagem num bloco
 * troca em todos os blocos da página. Blocos sem a linguagem escolhida caem na
 * própria primeira aba. Recriado a cada init (o DOM é trocado).
 */
function setupCodeTabs(): void {
	const groups = Array.from(
		document.querySelectorAll<HTMLElement>("[data-code-tabs]"),
	);
	if (groups.length === 0) return;

	function activate(lang: string): void {
		preferredLang = lang;
		for (const group of groups) {
			const tabs = Array.from(
				group.querySelectorAll<HTMLElement>("[data-code-tab]"),
			);
			const panels = Array.from(
				group.querySelectorAll<HTMLElement>("[data-code-tab-panel]"),
			);
			const hasLang = tabs.some((t) => t.dataset.lang === lang);
			const target = hasLang ? lang : (tabs[0]?.dataset.lang ?? "");
			for (const tab of tabs) {
				const on = tab.dataset.lang === target;
				tab.setAttribute("aria-selected", on ? "true" : "false");
				tab.tabIndex = on ? 0 : -1;
			}
			for (const panel of panels) {
				panel.classList.toggle("is-active", panel.dataset.lang === target);
			}
		}
	}

	for (const group of groups) {
		for (const tab of Array.from(
			group.querySelectorAll<HTMLElement>("[data-code-tab]"),
		)) {
			tab.addEventListener("click", () => {
				const lang = tab.dataset.lang;
				if (lang) activate(lang);
			});
		}
	}

	const initial =
		preferredLang ??
		groups[0].querySelector<HTMLElement>("[data-code-tab]")?.dataset.lang ??
		"";
	if (initial) activate(initial);
}

/** Botões de copiar código (comuns aos dois modos de leitura). */
function setupCopyButtons(): void {
	for (const btn of Array.from(
		document.querySelectorAll<HTMLElement>("[data-copy]"),
	)) {
		btn.addEventListener("click", async () => {
			const block = btn.closest("[data-code-block]");
			const editor = block?.querySelector<HTMLTextAreaElement>(
				"[data-sandbox-editor-input]",
			);
			const editorWrap = editor?.closest<HTMLElement>("[data-sandbox-editor]");
			const code =
				editor && editorWrap && !editorWrap.hidden
					? editor.value
					: (block?.querySelector("[data-code-surface] pre")?.textContent ??
						"");
			try {
				await navigator.clipboard.writeText(code);
				flashCopied(btn);
			} catch {
				/* clipboard indisponível (ex.: file://) — silencioso */
			}
		});
	}
}

/** Barra de progresso de leitura, dirigida por scroll da página. */
function updateProgressBar(): void {
	const bar = document.querySelector<HTMLElement>("[data-progress-bar]");
	if (!bar) return;
	const doc = document.documentElement;
	const max = doc.scrollHeight - doc.clientHeight;
	const ratio = max > 0 ? Math.min(1, doc.scrollTop / max) : 0;
	bar.style.transform = `scaleX(${ratio})`;
}

/** Listeners de janela registrados uma única vez (persistem entre navegações). */
function bindGlobalListeners(): void {
	if (globalsBound) return;
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
	window.addEventListener("scroll", updateProgressBar, { passive: true });
}

function setupReaderModeToggle(
	initialMode: ReaderMode,
	onChange: (mode: ReaderMode) => void,
): (mode: ReaderMode) => void {
	const buttons = Array.from(
		document.querySelectorAll<HTMLElement>("[data-reader-mode-option]"),
	);

	function sync(mode: ReaderMode): void {
		for (const button of buttons) {
			const active = button.dataset.readerModeOption === mode;
			button.toggleAttribute("data-active", active);
			button.setAttribute("aria-pressed", active ? "true" : "false");
		}
	}

	for (const button of buttons) {
		button.addEventListener("click", () => {
			const mode = button.dataset.readerModeOption;
			if (!isReaderMode(mode)) return;
			onChange(mode);
		});
	}

	sync(initialMode);
	return sync;
}

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
	const reader = document.querySelector<HTMLElement>("[data-reader-mode]");
	const defaultMode = isReaderMode(reader?.dataset.readerMode)
		? reader.dataset.readerMode
		: "panels";
	let mode: ReaderMode = readStoredReaderMode() ?? defaultMode;
	const initialHash = location.hash.replace(/^#/, "");
	const hasInitialSectionHash = ids.includes(initialHash);
	let activeId = hasInitialSectionHash ? initialHash : (ids[0] ?? "");
	let sectionObserver: IntersectionObserver | null = null;
	const scrollAnchor =
		document.querySelector<HTMLElement>("[data-doc-top]") ?? null;
	const pager = document.querySelector<HTMLElement>("[data-reader-pager]");
	let syncModeToggle: (mode: ReaderMode) => void = () => {};

	// Comuns aos dois modos.
	setupCopyButtons();
	setupCodeTabs();

	function highlight(id: string): void {
		for (const link of navLinks) {
			const on = link.dataset.sectionLink === id;
			link.toggleAttribute("data-active", on);
			if (on) link.setAttribute("aria-current", "true");
			else link.removeAttribute("aria-current");
		}
	}

	function setActivePanel(id: string, opts: { push?: boolean } = {}): void {
		const target = ids.includes(id) ? id : ids[0];
		if (!target) return;
		activeId = target;

		for (const panel of panels) {
			const isActive = panel.dataset.sectionPanel === target;
			// Visibilidade via classe (.reader-js gate no CSS), não `hidden`,
			// para não afetar a indexação estática do Pagefind.
			panel.classList.toggle("is-active", isActive);
		}
		highlight(target);
		updatePager(target);

		if (opts.push !== false) {
			const url = `${location.pathname}${location.search}#${target}`;
			if (`#${target}` !== location.hash) {
				history.pushState({ section: target }, "", url);
			}
		}
		updateProgressBar();
	}

	function scrollToSection(id: string, behavior: ScrollBehavior): void {
		document.getElementById(id)?.scrollIntoView({ block: "start", behavior });
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

	function disconnectSectionObserver(): void {
		sectionObserver?.disconnect();
		sectionObserver = null;
	}

	function setupSectionObserver(): void {
		disconnectSectionObserver();
		// Banda de detecção entre ~30% e ~40% do topo da viewport: o capítulo cujo
		// topo cruza essa faixa vira o ativo.
		sectionObserver = new IntersectionObserver(
			(entries) => {
				const hit = entries
					.filter((e) => e.isIntersecting)
					.sort(
						(a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
					)[0];
				if (!hit) return;
				const id = (hit.target as HTMLElement).dataset.sectionPanel ?? "";
				if (id && id !== activeId) {
					activeId = id;
					highlight(id);
				}
			},
			{ rootMargin: "-30% 0px -60% 0px", threshold: 0 },
		);
		for (const panel of panels) sectionObserver.observe(panel);
	}

	function writeHash(id: string, push: boolean): void {
		const url = `${location.pathname}${location.search}#${id}`;
		if (`#${id}` === location.hash) return;
		if (push) history.pushState({ section: id }, "", url);
		else history.replaceState({ section: id }, "", url);
	}

	function clearHash(): void {
		if (!location.hash) return;
		const url = `${location.pathname}${location.search}`;
		history.replaceState({ section: ids[0] }, "", url);
	}

	function scrollToPageTop(): void {
		window.scrollTo({ top: 0, left: 0, behavior: "auto" });
	}

	function setMode(
		nextMode: ReaderMode,
		opts: { persist?: boolean; resetToTop?: boolean; scroll?: boolean } = {},
	): void {
		const shouldResetToTop = opts.resetToTop === true;
		if (shouldResetToTop) {
			activeId = ids[0] ?? activeId;
			clearHash();
		}

		mode = nextMode;
		if (reader) {
			reader.dataset.readerMode = nextMode;
			reader.classList.toggle("doc-panels-narrative", nextMode === "narrative");
		}
		if (pager) pager.hidden = nextMode === "narrative";
		syncModeToggle(nextMode);

		if (opts.persist !== false) storeReaderMode(nextMode);

		if (nextMode === "narrative") {
			for (const panel of panels) {
				panel.classList.toggle(
					"is-active",
					panel.dataset.sectionPanel === activeId,
				);
			}
			highlight(activeId);
			setupSectionObserver();
			if (shouldResetToTop) scrollToPageTop();
			else if (opts.scroll !== false) scrollToSection(activeId, "auto");
		} else {
			disconnectSectionObserver();
			setActivePanel(activeId, { push: false });
			if (shouldResetToTop) scrollToPageTop();
			else if (opts.scroll !== false) {
				scrollAnchor?.scrollIntoView({ block: "start", behavior: "auto" });
			}
		}

		updateProgressBar();
	}

	function activate(id: string, opts: { push?: boolean } = {}): void {
		const target = ids.includes(id) ? id : ids[0];
		if (!target) return;

		if (mode === "narrative") {
			activeId = target;
			highlight(target);
			scrollToSection(target, "auto");
			if (opts.push !== false) writeHash(target, false);
			updateProgressBar();
			return;
		}

		setActivePanel(target, opts);
	}

	syncModeToggle = setupReaderModeToggle(mode, (nextMode) => {
		if (nextMode === mode) return;
		setMode(nextMode, { resetToTop: true });
	});

	// Cliques de navegação de seção (nav lateral e pager).
	for (const link of [
		...navLinks,
		...Array.from(
			document.querySelectorAll<HTMLElement>(
				"[data-pager-prev],[data-pager-next]",
			),
		),
	]) {
		link.addEventListener("click", (event) => {
			const id = (event.currentTarget as HTMLElement).dataset.sectionLink;
			if (!id) return;
			event.preventDefault();
			if (mode === "narrative") {
				activeId = id;
				highlight(id);
				scrollToSection(id, "smooth");
				writeHash(id, false);
				return;
			}
			setActivePanel(id);
			scrollToPageTop();
		});
	}

	currentActivate = activate;

	// Deep-link inicial pela hash, senão a primeira seção.
	setMode(mode, { persist: false, scroll: false });
	if (mode === "narrative" && hasInitialSectionHash) {
		requestAnimationFrame(() => scrollToSection(activeId, "auto"));
	} else if (mode === "narrative") {
		requestAnimationFrame(scrollToPageTop);
	}

	bindGlobalListeners();
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
