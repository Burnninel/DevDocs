# Estrutura de Documentações Locais

## Objetivo

Manter as documentações locais, reutilizáveis e fáceis de evoluir, com abertura direta via `file://`, sem depender de servidor.

## Estrutura atual

```txt
DevDocs/
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
    _template.data.js
    <slug>.data.js
  docs/
    _template.html
    <slug>.html
  scripts/
    validate-docs.ps1
    validate-docs.js
```

## Como a arquitetura está organizada

- `index.html`: hub principal de entrada.
- `data/docs-manifest.data.js`: lista as documentações visíveis no hub.
- `docs/<slug>.html`: casca HTML mínima de cada documentação.
- `data/<slug>.data.js`: conteúdo estruturado da documentação.
- `assets/js/docs-core.js`: motor de renderização, busca, edição inline, salvar e copiar código.
- `assets/css/docs-theme.css`: tema visual compartilhado das documentações.
- `docs/_template.html` e `data/_template.data.js`: ponto de partida oficial para novas docs.

## Fluxo recomendado para criar uma nova documentação

1. Copie `docs/_template.html` para `docs/<slug>.html`.
2. Copie `data/_template.data.js` para `data/<slug>.data.js`.
3. No HTML, ajuste:
   - `data-doc-id="<slug>"`.
   - `<title>`.
   - texto inicial de `h1` e subtítulo.
   - script `../data/<slug>.data.js`.
4. No data file, ajuste:
   - `id`.
   - `title`.
   - `subtitle`.
   - `searchPlaceholder`.
   - `shortcutHint`.
   - `quickStart`, quando fizer sentido.
   - `sections`.
5. Registre a doc em `data/docs-manifest.data.js`.
6. Rode a validação.
7. Abra `index.html` e faça uma revisão visual/manual final.

## Convenções do data file

### Campos de topo

- `id`: deve ser único e igual ao `data-doc-id` do HTML.
- `title`: título principal da página.
- `subtitle`: resumo logo abaixo do título.
- `searchPlaceholder`: placeholder da busca.
- `shortcutHint`: linha de atalho acima do conteúdo.
- `codeLanguage`: linguagem padrão opcional.
- `defaultSectionLayout`: `"single"` ou `"two"`.
- `quickStart`: bloco reutilizável de onboarding no topo.
- `sections`: lista de seções da doc.

### `quickStart`

Use quando a doc tiver setup, requisito mínimo ou “primeiro teste” útil para onboarding.

Campos:

- `title`
- `kicker`
- `description`
- `steps`
- `code`
- `codeLanguage` opcional
- `callout` opcional

### Seções

Cada seção deve ter:

- `id`
- `name`
- `layout` opcional: `"single"` ou `"two"`
- `entries`

### Entries

Cada item da seção deve ter:

- `title`
- `kicker`
- `description`
- `code`
- `tags`

Campos opcionais:

- `descriptionTone`: `"default"` ou `"warn"`
- `span: "full"` para ocupar largura total
- `codeLanguage`
- `output`
- `callout`

### Callouts

Tipos aceitos:

- `hint`
- `warn`
- `danger`

Cada callout deve ter:

- `type`
- `label`
- `text`

## Boas práticas de conteúdo

### Texto

- Prefira explicações curtas, diretas e orientadas a uso real.
- Explique “quando usar” e não só “o que faz”.
- Quando houver ordem importante de parâmetros, deixe isso explícito na descrição.
- Destaque mentalmente a decisão que o leitor precisa tomar: transformar, filtrar, ordenar, comparar, acumular, combinar.

### Exemplos de código

- Use exemplos pequenos, executáveis e fiéis ao cenário real.
- Quando uma linha puder confundir, adicione comentário inline curto e objetivo.
- Evite comentários longos dentro do snippet.
- Se houver uma saída esperada relevante, prefira usar:
  - `output` no entry, ou
  - o padrão de bloco final `/* Saída: ... */`, que o core já extrai automaticamente.

### Tags

- Inclua termos técnicos e termos de busca naturais.
- Misture nomes de funções, verbos de ação e palavras que o usuário provavelmente digitaria.
- Evite duplicar tags sem necessidade.

### Edição inline

- Título, subtítulo, descrições, callouts e quickStart podem ser ajustados visualmente no modo edição.
- Sempre valide o resultado visual depois de alterar conteúdos com destaques inline.

## Validação

### Comando principal

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\validate-docs.ps1
```

### O que a validação cobre

- sintaxe dos scripts principais
- execução dos `data/*.data.js`
- estrutura obrigatória de cada documento
- `quickStart`, `sections`, `entries` e `callouts`
- consistência entre `doc.id`, registry e `data-doc-id`
- consistência entre manifesto, data files e arquivos HTML
- presença dos assets principais nas páginas
- aviso para arquivos HTML soltos na raiz

## Checklist final antes de considerar uma doc pronta

1. A doc aparece corretamente no hub.
2. Busca funciona e encontra os principais termos.
3. Quick start faz sentido para quem está começando.
4. Os exemplos têm contexto, não apenas código cru.
5. Saídas esperadas estão presentes onde ajudam a leitura.
6. Callouts aparecem apenas quando realmente agregam contexto.
7. Modo edição continua funcionando sem quebrar o layout.
8. Botão de copiar funciona nos blocos de código.
9. `scripts/validate-docs.ps1` passa sem erros.
10. A leitura no desktop e no mobile está confortável.

## Uso diário

- Use `index.html` como ponto de entrada principal.
- Favoritar somente o `index.html` costuma ser o melhor fluxo.
- Evite criar HTMLs soltos na raiz; prefira sempre `docs/`.
