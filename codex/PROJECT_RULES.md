# Regras Globais Do Projeto

## Arquitetura atual

O projeto e uma central de documentacoes locais.

- `index.html` e o hub de entrada.
- Cada documentacao tem um HTML minimo em `docs/`.
- O conteudo de cada doc fica em `data/*.data.js`.
- A renderizacao da doc e feita por `assets/js/docs-core.js`.
- O hub principal usa `assets/js/docs-hub.js`.
- O estilo visual compartilhado fica em `assets/css/`.
- A consistencia do projeto e validada por `scripts/validate-docs.js` e `scripts/validate-docs.ps1`.

Este projeto nao usa MVC e nao possui `controllers`, `services`, `models`, `routes` ou `views` no sentido tradicional.
Nao crie essas camadas ao trabalhar aqui.

## Convencoes de nomes

- Use `slug` em minusculas com hifen para ids e arquivos.
- O `data-doc-id` do HTML deve ser igual ao `id` da doc no data file.
- O arquivo HTML deve seguir `docs/<slug>.html`.
- O arquivo de dados deve seguir `data/<slug>.data.js`.
- O manifesto deve apontar para `./docs/<slug>.html`.

## Padrao de dados

Cada `data/*.data.js` registra exatamente uma doc em:

- `window.DOC_DATA_REGISTRY["<slug>"] = { ... }`

Campos esperados no documento:

- `id`
- `title`
- `subtitle`
- `searchPlaceholder`
- `shortcutHint`
- `defaultSectionLayout` opcional: `single` ou `two`
- `codeLanguage` opcional
- `quickStart` opcional
- `sections`

Campos esperados nas secoes:

- `id`
- `name`
- `layout` opcional: `single` ou `two`
- `entries`

Campos esperados nas entries:

- `title`
- `kicker`
- `description`
- `code`
- `tags`

Campos opcionais em entry:

- `descriptionTone`: `default` ou `warn`
- `span`: `full`
- `codeLanguage`
- `output`
- `callout`

Tipos aceitos para callout:

- `hint`
- `warn`
- `danger`

## Regras de implementacao

- Reutilize o template em `docs/_template.html` e `data/_template.data.js`.
- Mantenha os scripts com `defer` nas paginas.
- Preserve os caminhos relativos atuais dos assets.
- Mantenha o projeto compativel com abertura direta em navegador local via `file://`.
- Preserve a edicao inline existente em vez de criar um editor paralelo.
- Preserve o fallback de download quando o navegador nao suportar gravacao direta com `showSaveFilePicker`.

## Validacao e retorno

O projeto nao tem API nem camada de retorno HTTP.
As garantias atuais sao:

- validacao estrutural via `scripts/validate-docs.ps1`
- renderizacao correta no navegador
- consistencia entre manifesto, HTML e data files

Sempre que criar ou alterar uma doc:

1. ajuste HTML e data file mantendo o mesmo `slug`
2. registre no manifesto, se for nova
3. rode `powershell -ExecutionPolicy Bypass -File .\\scripts\\validate-docs.ps1`

## O que evitar

- Nao mover docs para fora de `docs/`.
- Nao criar HTMLs soltos na raiz, exceto casos de compatibilidade ja existentes.
- Nao duplicar renderer por documentacao.
- Nao colocar conteudo principal diretamente no HTML quando ele deve viver no data file.
- Nao mudar o formato de `window.DOC_DATA_REGISTRY` ou `window.DOCS_MANIFEST`.
- Nao inventar novos layouts alem de `single` e `two` sem necessidade explicita.
- Nao inventar novos tipos de callout sem atualizar validacao, renderer e CSS de forma consistente.
