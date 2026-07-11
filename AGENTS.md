# Instruções para IA

> **Atualizado no rebuild.** Este projeto **não é mais** o site HTML estático
> aberto via `file://`. Agora é um projeto **Astro + Vue** (SSG) publicado no
> GitHub Pages. O conteúdo antigo em `docs/*.html` + `data/*.data.js` foi migrado
> e removido. A descrição antiga desta arquitetura vive, apenas como histórico,
> em `codex/` e `README_DOCS.md` — **não a siga**.

Antes de alterar qualquer coisa, leia:

1. `README.md` — visão geral, scripts e arquitetura atual.
2. `TECH_DECISIONS.md` — stack, versões e desvios documentados.
3. `CONTENT_GAPS.md` — o que falta de conteúdo (não inventar).

Regras principais:

- **Conteúdo** vive em `src/content/docs/*.yaml`, validado pelo schema Zod em
  `src/content.config.ts`. Nunca coloque layout no conteúdo.
- **Nova doc**: criar `src/content/docs/<tech>-<tema>.yaml` (campos `tech` e
  `order` obrigatórios). A home/landing se atualizam sozinhas. Rode `npm run check`.
- **Design inegociável**: zero bordas por padrão (separar por tom/espaço/glass),
  nada de box-shadow genérico (só glow sutil do accent), overflow sempre contido,
  tema escuro fosco, tokens centralizados em `src/styles/tokens.css` — nada de
  valores hardcoded em componente.
- **Duas zonas de animação**: descoberta (home/landings) com reveals; leitura
  (docs) com movimento mínimo. Sempre respeitar `prefers-reduced-motion`.
- **Links internos** sempre via helpers de `src/lib/paths.ts` (o Astro não
  prefixa o `base` do GH Pages automaticamente).
- Rode `npm run build` (inclui `astro check` + Pagefind) antes de considerar pronto.

Na dúvida sobre um padrão, copie o comportamento dos componentes existentes em
`src/components/` em vez de inventar uma abordagem nova.
