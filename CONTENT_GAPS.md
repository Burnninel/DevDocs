# CONTENT_GAPS

Lacunas de conteúdo identificadas na migração. **Nada aqui foi inventado** — são
tópicos ausentes ou incompletos no projeto legado, sinalizados como TODO conforme
a Fase 5 pediu.

## Cobertura atual (migrada, 100% preservada)

- **Git/GitHub** — 1 guia (completo).
- **PHP** — 14 guias (Fases 1–3 do `codex/PHP_DOCS_IMPROVEMENT_PLAN.md` concluídas).
- **Go** — 13 guias (Fases 1–3 do `codex/GO_DOCS_IMPROVEMENT_PLAN.md` concluídas).

Total: **28 docs · 165 seções · 289 entries · 107 callouts · 39 content-blocks ·
306 blocos de código**. Fidelidade verificada por round-trip + contagens no
`scripts/migrate-content.mjs`.

## Lacunas (TODO — não preencher com conteúdo inventado)

### 🔴 Vue — ausente
O prompt do rebuild listava Vue como "já documentado", mas **não existe nenhum
conteúdo Vue** no repositório legado. A arquitetura já está pronta para receber
(basta adicionar `src/content/docs/vue-*.yaml` com `tech: vue`); a home passa a
exibir a seção Vue automaticamente quando houver ≥1 doc. Nenhuma página Vue é
mostrada por ora.

### 🟡 PHP — P3/P4 (não iniciado no legado)
- PHP CLI (`$argv`, `getopt`).
- PHP 8+ avançado: enums, `readonly`, attributes.
- `include`/`require` e autoload manual (poderia virar seção em OOP/Composer).

### 🟡 Go — P4 (não iniciado no legado)
- Generics (sintaxe e quando simplifica vs. interface).
- Tooling: `go vet`, `staticcheck`, `golangci-lint`.
- Polimento de tags/sinônimos de busca (Fase 4 do plano Go, parcialmente aberta).

## Como adicionar uma nova doc

1. Criar `src/content/docs/<tech>-<tema>.yaml` seguindo o schema de
   `src/content.config.ts` (campos `tech` e `order` obrigatórios).
2. `npm run check` valida contra o Zod; `npm run dev` renderiza.
3. A home e a landing da tecnologia se atualizam sozinhas (agrupamento por `tech`).
