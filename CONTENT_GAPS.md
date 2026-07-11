# CONTENT_GAPS

Lacunas de conteúdo identificadas na migração. **Nada aqui foi inventado** — são
tópicos ausentes ou incompletos no projeto legado, sinalizados como TODO conforme
a Fase 5 pediu.

## Cobertura atual

- **Git/GitHub** — 1 guia (completo, com conflito de merge, `.gitignore` e
  tags/releases cobertos).
- **PHP** — 19 guias (núcleo premium concluído: fundamentos, OOP, arrays,
  strings, JSON, HTTP, PDO, sessões, arquivos, CLI, testes, recursos modernos e
  capstone de API).
- **Go** — 15 guias (paridade com PHP: banco de dados com `database/sql`
  (`go-banco-dados.yaml`) e capstone de API com `net/http` (`go-api-json.yaml`);
  os 13 guias originais ganharam fecho reflexivo padronizado — `Decisão Rápida`
  com `reference-card` + `context-block`).

Total: **35 docs · 220 seções · 394 entries · 137 callouts · 84 content-blocks ·
363 blocos de código** (contagem atual, `grep` sobre `src/content/docs/*.yaml`).
O conteúdo legado foi migrado com fidelidade verificada por round-trip +
contagens no `scripts/migrate-content.mjs`; todo o conteúdo (migrado e novo)
segue o padrão editorial de `CONTENT_STANDARD.md`.

## Lacunas (TODO — não preencher com conteúdo inventado)

### 🔴 Vue — ausente
O prompt do rebuild listava Vue como "já documentado", mas **não existe nenhum
conteúdo Vue** no repositório legado. A arquitetura já está pronta para receber
(basta adicionar `src/content/docs/vue-*.yaml` com `tech: vue`); a home passa a
exibir a seção Vue automaticamente quando houver ≥1 doc. Nenhuma página Vue é
mostrada por ora.

### 🟢 PHP — núcleo premium concluído
As lacunas principais de PHP foram cobertas nesta rodada:

- Fundamentos da linguagem (`php-fundamentos.yaml`).
- Testes com PHPUnit (`php-testes.yaml`).
- CLI (`php-cli.yaml`).
- PHP 8+ moderno: enums, `readonly`, attributes e tipos (`php-recursos-modernos.yaml`).
- Capstone de API JSON (`php-api-json.yaml`).
- `include`/`require` manual dentro de `php-composer-autoload.yaml`.

Backlog opcional futuro: páginas dedicadas de performance e segurança se houver
necessidade real, sem perseguir exaustividade artificial.

### 🟢 Go — paridade com PHP concluída
- Banco de dados com `database/sql` (`go-banco-dados.yaml`).
- Capstone de API JSON com `net/http` (`go-api-json.yaml`).
- Fecho reflexivo (`Decisão Rápida`) em todos os 15 guias.

### 🟡 Go — backlog (não iniciado)
- Generics (sintaxe e quando simplifica vs. interface).
- `regexp` (Go não tinha equivalente ao `PHP: Expressões regulares`).
- Tooling: `go vet`, `staticcheck`, `golangci-lint`.
- Polimento de tags/sinônimos de busca (Fase 4 do plano Go, parcialmente aberta).

## Como adicionar uma nova doc

1. Criar `src/content/docs/<tech>-<tema>.yaml` seguindo o schema de
   `src/content.config.ts` (campos `tech` e `order` obrigatórios).
2. `npm run check` valida contra o Zod; `npm run dev` renderiza.
3. A home e a landing da tecnologia se atualizam sozinhas (agrupamento por `tech`).
