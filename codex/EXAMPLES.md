# Exemplos Reais Do Projeto

## 1. Exemplo do manifesto do hub

Arquivo real: `data/docs-manifest.data.js`

```js
window.DOCS_MANIFEST = {
	title: "Central de Documentacoes",
	docs: [
		{
			id: "git-github-terminal",
			title: "Git e GitHub no Terminal",
			href: "./docs/git-github-terminal.html",
			actionLabel: "Abrir documentacao",
		},
	],
};
```

Padrao:

- o hub sempre le `window.DOCS_MANIFEST`
- cada item aponta para um HTML dentro de `docs/`

## 2. Exemplo da shell HTML de uma doc

Arquivos reais: `docs/_template.html`, `docs/php-arrays.html`

```html
<div class="app-shell" data-doc-id="php-arrays">
    <header class="app-header">
        <div class="header-inner">
            <div class="brand">
                <h1 id="docTitle">PHP no Terminal: Arrays</h1>
                <p id="docSubtitle">Base pratica para manipulacao de arrays em PHP no dia a dia.</p>
            </div>
        </div>
    </header>

    <script defer src="../data/php-arrays.data.js"></script>
    <script defer src="../assets/js/docs-core.js"></script>
</div>
```

Padrao:

- o HTML e uma shell minima
- o conteudo real vem do data file
- `data-doc-id` precisa casar com o id da doc

## 3. Exemplo de data file de documentacao

Arquivos reais: `data/php-arrays.data.js`, `data/git-github-terminal.data.js`

```js
window.DOC_DATA_REGISTRY = window.DOC_DATA_REGISTRY || {};
window.DOC_DATA_REGISTRY["php-arrays"] = {
	id: "php-arrays",
	title: "PHP: Manipulando Arrays",
	subtitle: "Guia pratico e mais completo para criar, transformar, buscar, ordenar e combinar arrays no PHP.",
	codeLanguage: "php",
	defaultSectionLayout: "single",
	sections: [
		{
			id: "base",
			name: "Base",
			layout: "single",
			entries: [
				{
					title: "Criar arrays indexados e associativos",
					kicker: "Entender a estrutura antes de manipular",
					description: "Array indexado e melhor para listas; array associativo e melhor para dados nomeados.",
					code: "<?php\n$nomes = [\"Ana\", \"Bruno\", \"Carla\"];",
					tags: ["php", "array", "base"],
				},
			],
		},
	],
};
```

Padrao:

- cada arquivo registra exatamente uma doc
- o id do registry, do objeto e do HTML devem ser iguais
- `tags` sao obrigatorias

## 4. Exemplo de quick start

Arquivo real: `data/php-arrays.data.js`

```js
quickStart: {
	title: "Como testar os exemplos desta documentacao",
	kicker: "Requisitos e execucao no terminal",
	description: "Para acompanhar os exemplos, voce so precisa do PHP CLI instalado.",
	steps: [
		"Verifique se o PHP esta disponivel com `php --version`.",
		"Execute no terminal com `php arrays.php`.",
	],
	codeLanguage: "shell",
	code: "php --version\nphp arrays.php",
	callout: {
		type: "hint",
		label: "Dica:",
		text: "se o comando `php` nao for reconhecido, instale o PHP CLI.",
	},
},
```

Padrao:

- use quick start quando a doc tiver setup ou primeiro teste util
- o bloco e renderizado antes das secoes

## 5. Exemplo de entry com callout

Arquivo real: `data/git-github-terminal.data.js`

```js
{
	title: "Conferir estado e historico",
	kicker: "Antes de commitar, puxar ou corrigir",
	description: "Mostra o estado dos arquivos e os ultimos commits.",
	code: "git status\ngit log --oneline --graph --decorate -n 15",
	tags: ["status", "log", "historico"],
	callout: {
		type: "hint",
		label: "Dica:",
		text: "rode isso antes de reset, merge e force push.",
	},
}
```

Padrao:

- `callout` fica dentro da entry
- tipos validos: `hint`, `warn`, `danger`

## 6. Exemplo do renderer usado pelo projeto

Arquivo real: `assets/js/docs-core.js`

```js
const appShell = document.querySelector("[data-doc-id]");
const docId = appShell ? appShell.getAttribute("data-doc-id") : "";
const registry = window.DOC_DATA_REGISTRY || {};
const docData = docId ? registry[docId] : null;

if (docData) {
	renderFromData(docData);
}
```

Padrao:

- o core descobre a doc ativa pelo `data-doc-id`
- nao existe renderer especifico por pagina

## 7. Exemplo de nova funcionalidade no formato correto

Para adicionar uma nova doc:

1. copiar `docs/_template.html` para `docs/nova-doc.html`
2. copiar `data/_template.data.js` para `data/nova-doc.data.js`
3. ajustar `data-doc-id="nova-doc"` no HTML
4. ajustar `window.DOC_DATA_REGISTRY["nova-doc"]` no data file
5. registrar a nova doc em `data/docs-manifest.data.js`
6. validar com `powershell -ExecutionPolicy Bypass -File .\\scripts\\validate-docs.ps1`

Esse e o fluxo correto do projeto hoje.
