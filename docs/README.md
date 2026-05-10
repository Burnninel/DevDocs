# Pasta `docs/`

- Contém apenas a **casca HTML** de cada documentação (`<slug>.html`), com `data-doc-id` igual ao slug.
- O **conteúdo** (secções, exemplos, callouts) vive em `../data/<slug>.data.js` e é renderizado por `../assets/js/docs-core.js`.
- Novas páginas: copiar `_template.html`, registar no `../data/docs-manifest.data.js` e seguir `../codex/STRUCTURE.md` e `../codex/EXAMPLES.md`.
- Planos por linguagem ou eixo: `../codex/PHP_DOCS_IMPROVEMENT_PLAN.md`, `../codex/GO_DOCS_IMPROVEMENT_PLAN.md`.
