# TECH_DECISIONS

Decisões de stack do rebuild do DevDocs e o porquê de cada uma. Versões
confirmadas no npm em julho/2026 antes de instalar (o ecossistema muda rápido).

## Stack final (versões instaladas)

| Camada | Escolha | Versão | Nota |
|---|---|---|---|
| Framework | **Astro** | `^7.0.6` | Estável mais recente — **não** a v5 do plano original (ver desvio 1). SSG, islands. |
| UI interativa | **Vue 3** + `@astrojs/vue` | `3.5` / `^7.0.1` | Preferência do usuário. |
| Conteúdo | **Content Collections** (Content Layer API) | — | `glob()` loader sobre YAML, schema Zod. Config em `src/content.config.ts`. |
| Estilo | **Tailwind CSS v4** | `^4.3.2` | Config CSS-first (`@theme`) via `@tailwindcss/vite`. |
| Realce de código | **Shiki** (nativo do Astro) | — | Componente `<Code>` em build-time, tema `github-dark-default` fundido à superfície. |
| Transição de página | **`<ClientRouter />`** (`astro:transitions`) | — | Nome atual (renomeado de `<ViewTransitions />`). |
| Scroll reveal | **GSAP + ScrollTrigger** | `^3.15.0` | Zona de descoberta. |
| Busca | **Pagefind** | `^1.5.2` | Índice estático no build; roda em `npm run build`. |
| Ícones | **Iconify** via `astro-icon` | `^1.1.5` | Sets `lucide` + `simple-icons`, tree-shaken. |
| Fontes | **Fontsource** (self-hosted) | `5.x` | Space Grotesk (display), Onest (corpo), JetBrains Mono (código). Todas OFL, offline, sem CDN. |
| Qualidade | TypeScript strict, Prettier, `astro check` | TS `^6` | — |

## Hospedagem

GitHub Pages (`Burnninel/DevDocs`): `site: https://burnninel.github.io`, `base: /DevDocs`.
Deploy por GitHub Actions (`.github/workflows/deploy.yml`), com Pagefind rodando
dentro do build. Links internos sempre via helpers em `src/lib/paths.ts`
(`withBase`, `docUrl`, `techUrl`) — o Astro não prefixa `base` automaticamente.

## Desvios do plano inicial (documentados, como pedido)

1. **Astro 7, não 5.** A tabela do plano dizia "Astro (estável mais recente)";
   na prática a estável é a **v7**. APIs verificadas na doc oficial antes de usar
   (config de collections em `src/content.config.ts`, `glob` de `astro/loaders`,
   `<ClientRouter />`).

2. **Conteúdo como coleção de dados YAML tipada — não MDX em prosa.** O conteúdo
   legado já era **estruturado** (`sections → entries → callouts/contentBlocks`),
   não prosa. Migrar para MDX achataria a semântica. Optou-se por YAML validado
   por Zod (decisão confirmada com o usuário). Migração automática e verificável
   em `scripts/migrate-content.mjs` (round-trip + contagens).

3. **Lenis (smooth scroll) removido.** Conflita com o **deep-link por hash das
   seções**, que é central na navegação das docs (sequestra a posição de scroll,
   atrapalha restauração e âncoras). Mantivemos GSAP+ScrollTrigger para as
   revelações; o scroll é nativo. Ganho de robustez > o polimento do smooth-scroll
   para uma ferramenta de leitura.

4. **Command palette custom (Vue) em vez do Dialog do shadcn-vue/Reka UI.**
   `reka-ui` está instalado, mas a palette Cmd+K é bastante específica (Pagefind,
   sub-results, navegação por teclado). Um componente Vue próprio, acessível
   (role=dialog, aria-modal, foco, Escape, setas), evita depender de detalhes de
   API que mudam e entrega exatamente o comportamento desejado.

5. **`motion-v` instalado mas ainda não usado.** As microinterações atuais são
   cobertas por CSS/transições e GSAP. Fica disponível para quando houver uma
   microinteração declarativa que justifique.

## Zonas de animação

- **Descoberta** (home, landings): revelações fade+translate no scroll (GSAP),
  `[data-reveal]`. Rede de segurança garante que nenhum conteúdo fique invisível.
- **Leitura** (docs): scroll nativo, sem storytelling; só a troca de seção
  (instantânea) e a barra de progresso.
- `prefers-reduced-motion: reduce` desliga tudo globalmente (CSS) e nos scripts.

## Progressive enhancement

A troca de seção esconde as inativas **via classe** (`.reader-js` gate), não via
`hidden`, para não afetar a indexação estática do Pagefind e manter tudo legível
sem JS.
