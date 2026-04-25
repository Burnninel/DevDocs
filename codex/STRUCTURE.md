# Estrutura Do Projeto

## Pastas e arquivos principais

```txt
DevDocs/
  AGENTS.md
  index.html
  README_DOCS.md
  GIT_GITHUB_TERMINAL_DOCS_REMAKE.html
  assets/
    css/
      docs-theme.css
      docs-hub.css
    js/
      docs-core.js
      docs-hub.js
  codex/
    PROJECT_RULES.md
    STRUCTURE.md
    EXAMPLES.md
  data/
    docs-manifest.data.js
    _template.data.js
    git-github-terminal.data.js
    php-arrays.data.js
  docs/
    _template.html
    git-github-terminal.html
    php-arrays.html
  scripts/
    validate-docs.js
    validate-docs.ps1
```

## Fluxo principal da aplicacao

### Hub

1. O navegador abre `index.html`.
2. `index.html` carrega `data/docs-manifest.data.js`.
3. `assets/js/docs-hub.js` le `window.DOCS_MANIFEST`.
4. O hub renderiza a lista de documentacoes disponiveis.

### Pagina de documentacao

1. O navegador abre `docs/<slug>.html`.
2. O HTML define `data-doc-id="<slug>"`.
3. A pagina carrega `data/<slug>.data.js`.
4. O data file registra o documento em `window.DOC_DATA_REGISTRY`.
5. `assets/js/docs-core.js` le o `data-doc-id`.
6. O renderer encontra a doc correspondente no registry.
7. O core monta header, tabs, quick start, secoes, entries, callouts, codigo, busca e modo edicao.

## Fluxo de edicao

1. O usuario ativa o modo edicao.
2. O core exibe os handles de edicao nos campos suportados.
3. A alteracao vira pendencia em memoria.
4. Ao salvar, o core tenta gravar no arquivo de dados atual.
5. Se o navegador nao permitir gravacao direta, o sistema baixa uma copia atualizada.

## Onde adicionar novas funcionalidades

### Nova documentacao

- Criar `docs/<slug>.html` a partir de `docs/_template.html`
- Criar `data/<slug>.data.js` a partir de `data/_template.data.js`
- Registrar a doc em `data/docs-manifest.data.js`

### Novo comportamento global da doc

- Renderer, busca, modo edicao, copiar codigo e salvar: `assets/js/docs-core.js`
- Hub principal: `assets/js/docs-hub.js`
- Visual de paginas de doc: `assets/css/docs-theme.css`
- Visual do hub: `assets/css/docs-hub.css`
- Regras de consistencia: `scripts/validate-docs.js`

## Onde nao colocar codigo novo

- Nao coloque conteudo de doc dentro de `assets/js/docs-core.js`.
- Nao replique HTML completo de uma doc em cada pagina alem da shell minima.
- Nao use a raiz para criar paginas oficiais novas; use `docs/`.
- Nao coloque regra estrutural so no CSS quando ela tambem depende da validacao e do renderer.
