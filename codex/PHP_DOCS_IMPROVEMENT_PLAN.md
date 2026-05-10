# Plano de aperfeiçoamento — documentações PHP (DevDocs)

Documento de referência para evoluir a cobertura e a qualidade das guias PHP deste repositório. Alinhado à auditoria do projeto (hub `file://`, fluxo `docs/<slug>.html` + `data/<slug>.data.js` + manifesto).

## Objetivos

- Fechar lacunas **fundamentais** que ainda não têm guia dedicado, sem duplicar o que já está bem coberto.
- Melhorar **consistência** entre guias (tom, estrutura de secções, `quickStart` onde fizer sentido, tags para busca).
- Manter o padrão oficial: validar com `powershell -ExecutionPolicy Bypass -File .\scripts\validate-docs.ps1` após cada alteração relevante.

## Estado atual (referência rápida)

Guias PHP já no manifesto:

| Slug | Foco principal |
|------|----------------|
| `php-arrays` | Arrays: base, transformação, busca, ordenação, composição |
| `php-orientacao-objetos` | Classes, encapsulamento, herança/polimorfismo, boas práticas |
| `php-composer-autoload` | Composer, `composer.json`, PSR-4, `vendor/`, `use` |
| `php-debugging` | Echo, dump, breakpoints, APIs JSON no debug |
| `php-erros-excecoes` | `Throwable`, try/catch, APIs de erro, produção |
| `php-headers-http` | `header()`, CORS, cache, status, APIs |
| `php-json` | `json_encode` / `json_decode`, flags, `JsonException` |
| `php-strings` | Criação, funções, busca, transformação, array ↔ string |
| `php-datetime` | `DateTimeImmutable`, timezone, `format`, UTC |
| `php-regex` | `preg_*`, delimitadores, Unicode, `preg_quote` |
| `php-banco-dados` | PDO, CRUD, prepared statements, erros |
| `php-sessoes-cookies-tokens` | Sessão, cookies seguros, tokens, CSRF |
| `php-ficheiros-io` | Leitura/escrita, caminhos, streams, pós-upload |
| `php-superglobais` | `$_SERVER`, `$_GET`, `$_POST`, etc., com segurança |

## O que falta (lacunas sugeridas)

Prioridade sugerida: **P1** primeiro impacto no dia a dia; **P2** complemento; **P3** aprofundamento ou casos mais específicos.

### P1 — Novos guias ou blocos grandes _(concluído no repositório)_

1. **Erros e exceções em PHP** (slug: `php-erros-excecoes`)
   - `try` / `catch` / `finally`, hierarquia `Throwable` / `Exception` / `Error`.
   - Quando usar exceção vs retorno; mensagens seguras em produção vs desenvolvimento.
   - Relação com APIs JSON (referência cruzada com `php-headers-http` e `php-debugging`).

2. **JSON em PHP** (slug: `php-json`)
   - `json_encode` / `json_decode`, flags úteis, `JSON_THROW_ON_ERROR`.
   - Tratamento de falha, UTF-8, tipos e `stdClass` vs array.
   - Referência a headers/respostas API onde couber.

3. **Composer, namespaces e autoload PSR-4** (slug: `php-composer-autoload`)
   - `composer init`, `require`, `vendor/`, `autoload`.
   - `namespace`, `use`, autoload de classes do projeto.
   - Complemento natural de `php-orientacao-objetos`.

### P2 — Novos guias ou extensões _(concluído no repositório)_

4. **Datas e horários** (slug: `php-datetime`)
   - `DateTime`, `DateTimeImmutable`, timezone, `format` / `createFromFormat`.
   - Armazenar em UTC, exibir em timezone local (boas práticas).

5. **Ficheiros e I/O** (slug: `php-ficheiros-io`)
   - `file_get_contents` / `file_put_contents`, `fopen` e modos, caminhos seguros.
   - Upload já encostado em `php-superglobais`; aqui foco em leitura/escrita servidor, CSV simples, logs.

6. **Regex (`preg_*`)** (slug: `php-regex`)
   - Quando regex vs funções de string; delimitadores; `preg_match`, `preg_replace`.
   - Callouts de performance e legibilidade.

### P3 — Opcional / nicho

7. **PHP CLI** (`$argv`, `getopt`) — útil se usas scripts locais.
8. **include/require e autoload “manual”** — pode ser uma secção curta dentro do guia Composer ou um mini bloco em OOP, em vez de guia inteiro.
9. **Extensões / temas avançados** (attributes, enums PHP 8.1+, readonly) — avaliar depois de P1/P2; pode integrar-se em `php-orientacao-objetos` como secção avançada.

## O que pode melhorar (guias existentes)

Transversal (aplicar onde fizer sentido):

- **Referências cruzadas na descrição**: mencionar explicitamente outro slug quando o leitor deva ir lá (ex.: superglobais → sessões; headers → JSON; **superglobais `$_FILES` → ficheiros I/O** — callout adicionado).
- **`quickStart`**: reforçado em `php-banco-dados`, `php-sessoes-cookies-tokens`, `php-superglobais`, `php-headers-http`, `php-strings` (ligações a outras guias onde faltava contexto).
- **Tags**: sinónimos extra em `$_SESSION` (sessões, `superglobais`, `csrf`); demais guias já tinham cobertura suficiente para a busca atual.
- **Callouts**: fronteira sessões ↔ superglobais e lembretes de segurança em fluxos HTTP mantidos; sem alterar tipos de callout do projeto.

Por guia (revisão pontual, sem obrigar mega-refactor):

| Guia | Melhoria sugerida |
|------|-------------------|
| `php-banco-dados` | Transações — **feito** (secção 8 + checklist + `quickStart`). |
| `php-headers-http` | Ligar a JSON e erros de API — **feito** (`php-json`, `php-erros-excecoes`, `quickStart`). |
| `php-debugging` | Ligar a exceções e a JSON — **feito** (`php-erros-excecoes`, `php-json`). |
| `php-sessoes-cookies-tokens` / `php-superglobais` | Fronteira e links — **feito** (`quickStart` + texto em `$_SESSION` / primeira secção de sessões). |
| `php-strings` | `quickStart` com remissão a **regex** e **JSON** — **feito**. |
| `php-arrays` | Manter; `decisao-rapida` já existe neste guia. |

## Documentação do próprio repositório

- Atualizar `codex/STRUCTURE.md` para listar **todas** as docs do manifesto (PHP + Git), para não divergir da realidade ao implementar novas guias.
- Eixo **Go** (quando ativo): plano e checklist em `codex/GO_DOCS_IMPROVEMENT_PLAN.md`; após novos slugs, alinhar a árvore de ficheiros em `STRUCTURE.md` como para PHP.

## Plano de execução (fases)

### Fase 0 — Preparação

- Ler `data/_template.data.js` e `docs/_template.html` como base de qualquer slug novo.
- Definir slugs finais em kebab-case e títulos no manifesto antes de escrever conteúdo longo.

### Fase 1 — P1 (fundação linguagem + API) — **concluída**

- [x] `php-erros-excecoes` (HTML + data + manifesto).
- [x] `php-json` (HTML + data + manifesto).
- [x] `php-composer-autoload` (HTML + data + manifesto).
- [x] Referências cruzadas mínimas (erros ↔ debugging; json ↔ headers; composer ↔ OOP; debugging → JSON).
- [x] Validar com `validate-docs.ps1`; revisão manual no browser recomendada após mudanças grandes.

### Fase 2 — P2 (dados e sistema) — **concluída**

- [x] `php-datetime` (HTML + data + manifesto).
- [x] `php-ficheiros-io` (HTML + data + manifesto; `quickStart` e secção pós-upload remetem a `php-superglobais`).
- [x] `php-regex` (HTML + data + manifesto).
- [x] Callout em `php-superglobais` (`$_FILES`) → `php-ficheiros-io`.
- [x] Validar com `validate-docs.ps1`; revisão visual no browser recomendada.

### Fase 3 — Polimento transversal — **concluída**

- [x] Referências cruzadas e `quickStart` (sessões ↔ superglobais; strings → regex/JSON; headers → JSON/erros; banco → erros/transações).
- [x] Transações em `php-banco-dados`; tags em `$_SESSION` (superglobais).
- [x] `codex/STRUCTURE.md` já refletia o manifesto pós-Fase 2; sem mudança de ficheiros nesta fase.

### Fase 4 — P3 (opcional)

- CLI, tópicos PHP 8 avançados, ou integração em OOP conforme preferência.

---

## Checklist de implementação

**Última meta concluída:** Fase 3 (transações PDO, ligações sessões/superglobais, `quickStart` em strings/headers/banco, validação OK).

Marque `[x]` conforme for concluindo. Cada novo guia: copiar template → ajustar `data-doc-id` / scripts no HTML → preencher registry → entrada no manifesto → validar.

### Fase 0

- [x] Confirmar slugs e títulos finais para P1 (evitar renomear ficheiros depois).
- [x] Atualizar `codex/STRUCTURE.md` com lista atual do manifesto **ou** deixar explicitamente no fim da Fase 3 (escolher uma política e cumprir).

### Fase 1 — Novos guias P1

- [x] `php-erros-excecoes`: `docs/php-erros-excecoes.html` + `data/php-erros-excecoes.data.js` + manifesto.
- [x] `php-json`: HTML + data + manifesto.
- [x] `php-composer-autoload`: HTML + data + manifesto.
- [x] Referências cruzadas mínimas: erros ↔ debugging; json ↔ headers-http; composer ↔ OOP; debugging → JSON.
- [x] Rodar `.\scripts\validate-docs.ps1` e corrigir até passar.

### Fase 2 — Novos guias P2

- [x] `php-datetime`: HTML + data + manifesto.
- [x] `php-ficheiros-io`: HTML + data + manifesto (coordenar texto com `php-superglobais` em `$_FILES` sem duplicar páginas inteiras).
- [x] `php-regex`: HTML + data + manifesto.
- [x] Rodar validação.

### Fase 3 — Melhorias em guias existentes

- [x] `php-banco-dados`: transações (secção 8 + checklist + `quickStart`).
- [x] `php-headers-http`: menções a JSON / erros de API (`quickStart` + conteúdo anterior).
- [x] `php-debugging`: menção a exceções quando o guia P1 existir.
- [x] `php-sessoes-cookies-tokens` / `php-superglobais`: revisão de fronteira temática e links.
- [x] Revisão de `quickStart` onde faltar (strings, headers, sessões, superglobais, banco).
- [x] Revisão de tags (sinónimos) nos guias tocados (`$_SESSION` em superglobais).
- [x] `codex/STRUCTURE.md` sincronizado com o manifesto (mantido; nenhum ficheiro novo nesta fase).

### Fase 4 — Opcional

- [ ] Guia ou secção **PHP CLI**.
- [ ] Secções **PHP 8+** (enums, readonly, attributes) em OOP ou guia dedicado.
- [ ] Última passagem de validação e leitura no hub.

---

## Notas

- Não alterar o formato de `window.DOC_DATA_REGISTRY` nem de `window.DOCS_MANIFEST` (regra do projeto).
- Novos tipos de callout ou layouts exigem alteração coordenada em validação, core e CSS — evitar salvo necessidade explícita.
- Este ficheiro é **plano e checklist**; o conteúdo pedagógico vive nos `data/*.data.js`.
