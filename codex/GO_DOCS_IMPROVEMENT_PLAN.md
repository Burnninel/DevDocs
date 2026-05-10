# Plano de implementação — documentações Go (DevDocs)

Documento de referência para introduzir o eixo **Go** neste repositório, no mesmo espírito do plano PHP: guias práticos, abertura via `file://`, fluxo oficial `docs/<slug>.html` + `data/<slug>.data.js` + `data/docs-manifest.data.js`, validação com `powershell -ExecutionPolicy Bypass -File .\scripts\validate-docs.ps1`.

## Objetivos

- Cobrir **fundamentos** e **hábitos idiomáticos** de Go (módulos, tipos, erros, testes) antes de aprofundar biblioteca padrão e concorrência.
- Manter **consistência** com as guias PHP existentes: tom direto, `quickStart` onde ajudar, tags úteis à busca, referências cruzadas entre slugs `go-*`.
- Não duplicar tutoriais oficiais extensos; focar em decisões do dia a dia e armadilhas comuns.

## Estado atual

| Aspeto | Situação |
|--------|----------|
| Guias `go-*` no manifesto | **Nenhuma** (eixo a criar) |
| `codeLanguage` nos data files | Usar `go` nos exemplos (alinhar ao que o renderer e realces esperam) |
| Modelo de trabalho | Copiar `docs/_template.html` e `data/_template.data.js`; ver `codex/STRUCTURE.md` e `codex/EXAMPLES.md` |

## Convenções de slug (proposta)

Prefixo **`go-`** em kebab-case, alinhado ao padrão `php-*`:

- `go-modulos` — não `go-modules` em título de ficheiro se preferir PT; slug pode ser inglês técnico para estabilidade de URLs locais.

Títulos no hub podem misturar **“Go:”** + descrição em português, como nas guias PHP.

## Lacunas sugeridas (prioridade)

### P1 — Base da linguagem e ferramenta

1. **`go-primeiros-passos`** (ou `go-base`)  
   - Pacotes, `package main`, `func main`, import paths.  
   - `go run`, `go build`, formatação com `go fmt` / `gofmt`.  
   - Convenções: nomes exportados, `go doc` breve.

2. **`go-modulos`**  
   - `go mod init`, `go.mod`, `go.sum`, versão mínima de Go (`toolchain` só se necessário).  
   - Dependências: `go get`, atualização, MVS (visão curta).  
   - `go work` (workspaces) como secção opcional ou P2.

3. **`go-tipos-valores`**  
   - Valores vs referências, ponteiros básicos, `new` vs literais.  
   - Structs, campos exportados, composição (sem OO clássica).

4. **`go-erros`**  
   - Tipo `error`, `errors.New`, `fmt.Errorf` e `%w`.  
   - `errors.Is`, `errors.As`, unwrap; padrão “return err” vs panic.  
   - Callout: quando usar `panic` (quase nunca em libs).

### P2 — Idiomas e biblioteca padrão no dia a dia

5. **`go-interfaces`**  
   - Interfaces implícitas, pequenas interfaces, satisfação em compile-time.  
   - Exemplo: `io.Reader` / `Writer` como contratos.

6. **`go-slices-maps`**  
   - Slices vs arrays, `append`, capacidade, partilha de backing array (armadilha).  
   - Maps, zero value, existência de chave, ordem de iteração.

7. **`go-json`**  
   - `encoding/json`, tags struct, `omitempty`, `json.RawMessage`.  
   - Erros de decode e tipos numéricos.

8. **`go-testing`**  
   - `testing`, table-driven tests, `t.Helper`, `-run`.  
   - `httptest` como bloco opcional (HTTP mínimo).

### P3 — Concorrência, I/O e serviços

9. **`go-concorrencia`**  
   - Goroutines, `sync.WaitGroup`, `sync.Mutex`, canais (buffered/unbuffered), `select`.  
   - Callouts: leaks, cancelamento (ponteiro para `go-context`).

10. **`go-context`**  
    - `context.Context`, prazos, cancelamento, valores (e quando **não** pôr valores).

11. **`go-http`**  
    - `net/http`: servidor mínimo, cliente, timeouts, `ListenAndServe` vs `Server`.  
    - Referência a `go-json` para APIs.

12. **`go-ficheiros-io`**  
    - `os`, `io`, `filepath` / `path`, leitura/escrita segura, `defer` em ficheiros.

13. **`go-time`** (opcional se P2 já estiver denso)  
    - `time.Time`, monotonic clock, UTC vs local, `time.Duration`.

### P4 — Nicho / avançado (avaliar depois)

- `go-generics` (sintaxe e quando simplifica vs interface).  
- `go-cgo` / FFI (só se houver necessidade explícita).  
- Ferramentas: `go vet`, `staticcheck`, `golangci-lint` (secção curta num guia de testes ou base).

## Referências cruzadas (diretrizes)

- `go-modulos` ↔ `go-primeiros-passos` (import path e módulo alinhados).  
- `go-erros` ↔ `go-json` (erros em handlers HTTP).  
- `go-http` ↔ `go-context` (request context, cancelamento).  
- `go-concorrencia` ↔ `go-context` (propagação de cancelamento).

## Plano de execução (fases)

### Fase 0 — Preparação

- [ ] Ler `data/_template.data.js`, `docs/_template.html`, `codex/EXAMPLES.md`.  
- [ ] Fixar lista final de slugs P1 (evitar renomes em massa).  
- [ ] Definir se o hub agrupa Go num subtítulo visual (só texto no `docs-manifest` vs ordem alfabética misturada com PHP).

### Fase 1 — P1 (base + erros)

- [ ] `go-primeiros-passos`: HTML + data + manifesto.  
- [ ] `go-modulos`: HTML + data + manifesto.  
- [ ] `go-tipos-valores`: HTML + data + manifesto.  
- [ ] `go-erros`: HTML + data + manifesto.  
- [ ] Referências cruzadas mínimas entre os quatro.  
- [ ] `.\scripts\validate-docs.ps1` sem erros.

### Fase 2 — P2 (interfaces, coleções, JSON, testes)

- [ ] `go-interfaces`, `go-slices-maps`, `go-json`, `go-testing`.  
- [ ] Ligações a P1 (por exemplo testes a importar padrões de erros).  
- [ ] Validar novamente.

### Fase 3 — P3 (concorrência, context, HTTP, ficheiros, tempo)

- [ ] Ordem sugerida: `go-context` antes ou em paralelo a `go-http` e `go-concorrencia`.  
- [ ] `go-ficheiros-io`, `go-time` (se existir slug dedicado).  
- [ ] Revisão de `quickStart` nos guias mais longos.

### Fase 4 — Polimento transversal

- [ ] Tags e sinónimos na busca (`goroutine`, `module`, `defer`, etc.).  
- [ ] Última passagem de callouts (segurança HTTP, paths).  
- [ ] Atualizar `codex/STRUCTURE.md` com a lista real de ficheiros `go-*` após inclusão no manifesto.

## Checklist rápido por novo guia

1. Copiar templates; ajustar `data-doc-id`, `<title>`, script do data file.  
2. `window.DOC_DATA_REGISTRY["<slug>"]` com `id` igual ao slug.  
3. Entrada em `data/docs-manifest.data.js`.  
4. Rodar `validate-docs.ps1`.  
5. Abrir `index.html` e a página da doc em `file://`.

## Notas

- Não alterar o formato de `window.DOC_DATA_REGISTRY` nem de `window.DOCS_MANIFEST` sem coordenação com validação e hub.  
- Exemplos Go nos snippets: preferir código que compile mentalmente (versão mínima do Go a mencionar no subtítulo ou `quickStart` quando relevante, por exemplo Go 1.22+ se usar `for range` em int).  
- Este ficheiro é **plano e checklist**; o conteúdo pedagógico vive nos `data/*.data.js`.  
- Plano PHP concluído no eixo previsto: `codex/PHP_DOCS_IMPROVEMENT_PLAN.md`.
