<script setup lang="ts">
/**
 * Command palette (Cmd/Ctrl+K, ou "/") sobre o índice estático do Pagefind.
 * Leva o resultado direto à seção certa (sub-results ancorados por heading).
 *
 * O índice do Pagefind só existe após o build (`pagefind --site dist`); em dev
 * o import falha e mostramos um aviso — sem quebrar nada.
 */
import { ref, watch, computed, onMounted, onUnmounted, nextTick } from "vue";

interface PalettePageResult {
	url: string;
	meta?: { title?: string };
	excerpt: string;
	sub_results?: { title: string; url: string; excerpt: string }[];
}
interface Item {
	title: string;
	url: string;
	excerpt: string;
	sub: boolean;
}

const base = import.meta.env.BASE_URL;
const baseNoSlash = base.replace(/\/$/, "");

const open = ref(false);
const query = ref("");
const rawResults = ref<PalettePageResult[]>([]);
const activeIndex = ref(0);
const loading = ref(false);
const unavailable = ref(false);
const inputEl = ref<HTMLInputElement | null>(null);
let lastFocused: HTMLElement | null = null;
let debounce = 0;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pagefind: any = null;

async function loadPagefind() {
	if (pagefind) return pagefind;
	try {
		pagefind = await import(/* @vite-ignore */ `${base}pagefind/pagefind.js`);
		await pagefind.init?.();
		return pagefind;
	} catch {
		pagefind = null;
		unavailable.value = true;
		return null;
	}
}

function withBase(url: string): string {
	const clean = url.split("#");
	const path = clean[0].startsWith(baseNoSlash + "/")
		? clean[0]
		: baseNoSlash + clean[0];
	return clean[1] ? `${path}#${clean[1]}` : path;
}

async function runSearch(q: string) {
	const pf = await loadPagefind();
	if (!pf || !q.trim()) {
		rawResults.value = [];
		return;
	}
	loading.value = true;
	const search = await pf.search(q);
	const data = await Promise.all(
		search.results.slice(0, 6).map((r: { data: () => Promise<PalettePageResult> }) => r.data()),
	);
	rawResults.value = data;
	activeIndex.value = 0;
	loading.value = false;
}

watch(query, (q) => {
	window.clearTimeout(debounce);
	debounce = window.setTimeout(() => runSearch(q), 150);
});

const items = computed<Item[]>(() => {
	const list: Item[] = [];
	for (const r of rawResults.value) {
		list.push({
			title: r.meta?.title ?? r.url,
			url: withBase(r.url),
			excerpt: r.excerpt,
			sub: false,
		});
		for (const s of (r.sub_results ?? []).slice(0, 3)) {
			if (s.url && s.title) {
				list.push({ title: s.title, url: withBase(s.url), excerpt: s.excerpt, sub: true });
			}
		}
	}
	return list;
});

function openPalette() {
	lastFocused = document.activeElement as HTMLElement;
	open.value = true;
	loadPagefind();
	nextTick(() => inputEl.value?.focus());
}
function closePalette() {
	open.value = false;
	query.value = "";
	rawResults.value = [];
	lastFocused?.focus?.();
}
function go(url: string) {
	closePalette();
	location.assign(url);
}

function onKeydown(e: KeyboardEvent) {
	const tag = (e.target as HTMLElement)?.tagName ?? "";
	const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(tag);
	if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
		e.preventDefault();
		open.value ? closePalette() : openPalette();
		return;
	}
	if (e.key === "/" && !open.value && !typing) {
		e.preventDefault();
		openPalette();
		return;
	}
	if (!open.value) return;
	if (e.key === "Escape") {
		e.preventDefault();
		closePalette();
	} else if (e.key === "ArrowDown") {
		e.preventDefault();
		activeIndex.value = Math.min(activeIndex.value + 1, items.value.length - 1);
	} else if (e.key === "ArrowUp") {
		e.preventDefault();
		activeIndex.value = Math.max(activeIndex.value - 1, 0);
	} else if (e.key === "Enter") {
		const it = items.value[activeIndex.value];
		if (it) go(it.url);
	}
}

function bindTriggers() {
	document
		.querySelectorAll<HTMLElement>("[data-search-open]")
		.forEach((el) => el.addEventListener("click", openPalette));
}

onMounted(() => {
	document.addEventListener("keydown", onKeydown);
	document.addEventListener("astro:page-load", bindTriggers);
	bindTriggers();
});
onUnmounted(() => {
	document.removeEventListener("keydown", onKeydown);
	document.removeEventListener("astro:page-load", bindTriggers);
});
</script>

<template>
	<div class="palette-root">
		<Transition name="palette">
			<div
				v-if="open"
				class="palette-overlay"
				role="dialog"
				aria-modal="true"
				aria-label="Buscar na documentação"
				@click.self="closePalette"
			>
			<div class="palette-panel glass">
					<div class="palette-input-row">
						<span class="palette-search-icon" aria-hidden="true">⌕</span>
						<input
							ref="inputEl"
							v-model="query"
							type="text"
							class="palette-input"
							placeholder="Buscar função, comando, seção…"
							autocomplete="off"
							spellcheck="false"
						/>
						<kbd class="palette-kbd">esc</kbd>
					</div>

					<div v-if="items.length" class="palette-results" role="listbox">
						<a
							v-for="(item, i) in items"
							:key="item.url + i"
							:href="item.url"
							class="palette-item"
							:class="{ 'is-active': i === activeIndex, 'is-sub': item.sub }"
							role="option"
							:aria-selected="i === activeIndex"
							@mouseenter="activeIndex = i"
							@click.prevent="go(item.url)"
						>
							<span class="palette-item-title">
								<span v-if="item.sub" class="palette-sub-mark">↳</span>
								{{ item.title }}
							</span>
							<!-- eslint-disable-next-line vue/no-v-html -->
							<span class="palette-item-excerpt" v-html="item.excerpt"></span>
						</a>
					</div>

					<div v-else class="palette-empty">
						<template v-if="unavailable">
							A busca é indexada no build. Rode
							<code>npm run build &amp;&amp; npm run preview</code> para testá-la.
						</template>
						<template v-else-if="query.trim() && !loading">
							Nada encontrado para “{{ query }}”.
						</template>
						<template v-else>
							Digite para buscar em todas as documentações.
						</template>
					</div>
				</div>
			</div>
		</Transition>
	</div>
</template>

<style scoped>
.palette-overlay {
	position: fixed;
	inset: 0;
	z-index: 100;
	display: flex;
	justify-content: center;
	align-items: flex-start;
	padding: 12vh 1rem 1rem;
	background: color-mix(in oklab, var(--color-base) 70%, transparent);
	backdrop-filter: blur(4px);
}
.palette-panel {
	width: 100%;
	max-width: 40rem;
	border-radius: var(--radius-xl);
	overflow: hidden;
	box-shadow: var(--glow-accent);
}
.palette-input-row {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	padding: 1rem 1.25rem;
}
.palette-search-icon {
	color: var(--color-accent);
	font-size: 1.25rem;
}
.palette-input {
	flex: 1;
	background: transparent;
	border: none;
	outline: none;
	color: var(--color-ink);
	font-family: var(--font-sans);
	font-size: 1.05rem;
}
.palette-input::placeholder {
	color: var(--color-faint);
}
.palette-kbd {
	font-family: var(--font-mono);
	font-size: 0.68rem;
	color: var(--color-faint);
	background: var(--color-surface-3);
	padding: 0.15rem 0.4rem;
	border-radius: 0.4rem;
}
.palette-results {
	max-height: 55vh;
	overflow-y: auto;
	padding: 0.5rem;
	display: grid;
	gap: 0.15rem;
}
.palette-item {
	display: grid;
	gap: 0.15rem;
	padding: 0.65rem 0.85rem;
	border-radius: var(--radius-md);
	transition: background var(--dur-fast) var(--ease-out);
}
.palette-item.is-active {
	background: var(--accent-soft);
}
.palette-item.is-sub {
	padding-left: 1.5rem;
}
.palette-item-title {
	color: var(--color-ink);
	font-weight: 500;
	font-size: 0.92rem;
}
.palette-sub-mark {
	color: var(--color-accent);
	margin-right: 0.35rem;
}
.palette-item-excerpt {
	color: var(--color-muted);
	font-size: 0.8rem;
	line-height: 1.45;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}
.palette-item-excerpt :global(mark) {
	background: transparent;
	color: var(--color-accent-strong);
	font-weight: 600;
}
.palette-empty {
	padding: 1.5rem;
	color: var(--color-muted);
	font-size: 0.9rem;
	text-align: center;
}
.palette-empty code {
	font-family: var(--font-mono);
	font-size: 0.8rem;
	color: var(--color-accent-strong);
}
.palette-enter-active,
.palette-leave-active {
	transition: opacity var(--dur-fast) var(--ease-out);
}
.palette-enter-from,
.palette-leave-to {
	opacity: 0;
}
.palette-enter-active .palette-panel,
.palette-leave-active .palette-panel {
	transition: transform var(--dur-base) var(--ease-out);
}
.palette-enter-from .palette-panel {
	transform: translateY(-8px) scale(0.98);
}
@media (prefers-reduced-motion: reduce) {
	.palette-enter-active,
	.palette-leave-active,
	.palette-enter-active .palette-panel {
		transition: none;
	}
}
</style>
