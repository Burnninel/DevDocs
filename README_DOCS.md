# Estrutura de Documentações (offline `file://`)

## Objetivo

Manter todas as documentações locais, reutilizáveis e fáceis de evoluir, sem depender de servidor.

## Estrutura de pastas

```txt
html/
  index.html
  assets/
    css/
      docs-theme.css
      docs-hub.css
    js/
      docs-core.js
      docs-hub.js
  data/
    docs-manifest.data.js
    git-github-terminal.data.js
    _template.data.js
  docs/
    git-github-terminal.html
    _template.html
```

## Como criar uma nova documentação

1. Copie `docs/_template.html` para `docs/<slug>.html`.
2. Copie `data/_template.data.js` para `data/<slug>.data.js`.
3. Ajuste no HTML:
    - `data-doc-id="..."` com o mesmo id do data file.
    - caminho do script `../data/<slug>.data.js`.
4. Ajuste no data file:
    - `id`, `title`, `subtitle`, `sections`.
5. Registre a nova doc em `data/docs-manifest.data.js`.

## Convenções de conteúdo (data file)

- `defaultSectionLayout`: `"two"` ou `"single"`.
- seção:
    - `layout`: `"two"` ou `"single"` (opcional, usa fallback do default).
- item:
    - `span: "full"` para ocupar largura total (útil para código longo).
    - `descriptionTone`: `"default"` ou `"warn"`.
    - `callout.type`: `"hint" | "warn" | "danger"`.
- `tags`: lista usada na busca.

## Validação

Execute:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\validate-docs.ps1
```

## Uso

- Favoritar somente `index.html`.
- Abertura direta no navegador via `file://` (sem live server).
