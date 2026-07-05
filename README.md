# DevDocs

Biblioteca pessoal de documentações técnicas — escura, fosca e sem ruído, feita
para consulta rápida no dia a dia. Reconstruída com **Astro + Vue** (a versão
antiga em HTML estático `file://` foi substituída).

Publicada em **GitHub Pages**: <https://burnninel.github.io/DevDocs/>

## Stack

Astro 7 (SSG) · Vue 3 (ilhas) · Tailwind v4 · Content Collections (YAML + Zod) ·
Shiki · GSAP/ScrollTrigger · Pagefind (busca) · astro-icon · Fontsource
(self-hosted). Detalhes e desvios em [`TECH_DECISIONS.md`](./TECH_DECISIONS.md).

## Scripts

```bash
npm run dev       # servidor de desenvolvimento
npm run build     # astro check + astro build + pagefind (índice de busca)
npm run preview   # serve o build em dist/ (necessário para testar a busca)
npm run check     # type-check (astro check)
npm run format    # prettier
```

> A busca (Pagefind) só existe após o `build`. Em `dev` a palette avisa isso.
> Requer **Node 22.12+**.

## Arquitetura

```
src/
  content/docs/*.yaml   # conteúdo: 1 doc por arquivo (schema em content.config.ts)
  content.config.ts     # schema Zod da coleção (fonte única do tipo do conteúdo)
  components/
    docs/               # Entry, CodeBlock, Callout, blocos, SectionNav, pager…
    home/               # Hero, DocCard
    shared/             # Navbar, Footer
    search/             # CommandPalette.vue (Cmd+K, sobre o índice Pagefind)
  layouts/              # BaseLayout, SiteLayout (home/tech), DocLayout (leitura)
  pages/                # /, /[tech]/, /[tech]/[doc]/, 404
  scripts/              # doc-reader (troca de seção), discovery (reveals)
  styles/               # tokens.css (design tokens), globals.css
  lib/                  # paths (base do GH Pages), docs (acesso ao conteúdo), format
```

### Navegação

Home (tecnologias) → `/[tech]/` (guias da tech) → `/[tech]/[doc]/` (intro + menu
de seções). A troca de seção é client-side (sem recarregar, sem rolar por tudo),
com deep-link por hash; a busca leva direto à seção certa.

## Adicionar uma documentação

1. Criar `src/content/docs/<tech>-<tema>.yaml` conforme o schema de
   `src/content.config.ts` (campos `tech` e `order` obrigatórios).
2. `npm run check` valida contra o Zod; `npm run dev` renderiza.
3. A home e a landing da tecnologia se atualizam sozinhas.

Lacunas de conteúdo conhecidas: [`CONTENT_GAPS.md`](./CONTENT_GAPS.md).

## Histórico

`codex/`, `AGENTS.md` e `README_DOCS.md` são referência **histórica** do projeto
antigo (HTML `file://`). O conteúdo foi migrado com fidelidade verificada por
`scripts/migrate-content.mjs` (289 entries · 107 callouts · 306 blocos de código).
