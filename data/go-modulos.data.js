window.DOC_DATA_REGISTRY = window.DOC_DATA_REGISTRY || {};
window.DOC_DATA_REGISTRY["go-modulos"] = {
	id: "go-modulos",
	title: "Go: Módulos",
	subtitle:
		"Guia prático para go mod init, ficheiros go.mod e go.sum, adicionar dependências com go get e o algoritmo MVS na gestão de versões.",
	searchPlaceholder: "Buscar go.mod, go.sum, go get, MVS ou palavra...",
	shortcutHint: "Atalho: pressione / para focar a busca.",
	codeLanguage: "go",
	defaultSectionLayout: "single",
	quickStart: {
		title: "Criar um módulo novo",
		kicker: "go mod init",
		description:
			"O caminho do módulo identifica o teu código (muitas vezes um URL que possa controlar, por exemplo `github.com/user/repo`). Dentro da pasta do projeto:",
		steps: [
			"Execute `go mod init caminho/do/modulo`.",
			"Confirme que apareceu `go.mod` na raiz.",
			"Adicione `main.go` com `package main` e `go run .` para testar.",
		],
		codeLanguage: "shell",
		code: "mkdir meu-cli && cd meu-cli\ngo mod init exemplo.local/meu-cli",
		callout: {
			type: "hint",
			label: "Documentação relacionada:",
			text: "relembre `package main` e `go run` em `Go: Primeiros passos` no hub.",
		},
	},
	sections: [
		{
			id: "go-mod-inicial",
			name: "go.mod e raiz do módulo",
			layout: "single",
			entries: [
				{
					title: "O que o go.mod declara",
					kicker: "Nome do módulo e versão mínima de Go",
					description:
						"A primeira linha `module caminho` define o prefixo de importação dos pacotes internos. `go` grava também a versão de Go usada ao criar ou atualizar o ficheiro. Comentários `// indirect` marcam dependências transitivas.",
					descriptionTone: "default",
					code: "module exemplo.local/meu-cli\n\ngo 1.22\n",
					codeLanguage: "plain",
					tags: ["go", "go.mod", "module", "versao", "dependencia"],
				},
				{
					title: "Importar pacotes do próprio módulo",
					kicker: "Caminho após o module",
					description:
						"Se o módulo é `exemplo.local/app`, um pacote em `./internal/auth` importa-se como `exemplo.local/app/internal/auth`. O `main` importa esse caminho completo; o ficheiro em `internal/auth` declara `package auth`.",
					descriptionTone: "default",
					code: "// cmd/hello/main.go\npackage main\n\nimport (\n\t\"fmt\"\n\n\t\"exemplo.local/app/internal/auth\"\n)\n\nfunc main() {\n\tfmt.Println(auth.Token())\n}\n\n// internal/auth/auth.go\npackage auth\n\nfunc Token() string {\n\treturn \"demo\"\n}\n",
					tags: ["go", "import", "modulo", "internal", "pacote"],
				},
			],
		},
		{
			id: "dependencias",
			name: "Dependências externas",
			layout: "single",
			entries: [
				{
					title: "go get para adicionar ou atualizar",
					kicker: "Grava require no go.mod",
					description:
						"`go get exemplo.com/pkg@v1.2.3` fixa uma versão. `go get exemplo.com/pkg@latest` pede a mais recente compatível. `go get -u ./...` tenta atualizar dependências diretas do módulo.",
					descriptionTone: "default",
					code: "go get github.com/google/uuid@latest",
					codeLanguage: "shell",
					tags: ["go", "go get", "dependencia", "require", "versao"],
				},
				{
					title: "go mod tidy",
					kicker: "Alinhar require com o código real",
					description:
						"Remove linhas `require` não usadas e adiciona as que faltam após mudanças de imports. Rode após refactors grandes para manter `go.mod` limpo.",
					descriptionTone: "default",
					code: "go mod tidy",
					codeLanguage: "shell",
					tags: ["go", "go mod tidy", "limpeza", "require"],
				},
			],
		},
		{
			id: "go-sum-e-mvs",
			name: "go.sum e MVS",
			layout: "single",
			entries: [
				{
					title: "Função do go.sum",
					kicker: "Integridade e versões exatas",
					description:
						"`go.sum` guarda hashes das versões descarregadas. Commit este ficheiro em repositórios de aplicação para builds reprodutíveis. Bibliotecas em Go também costumam versionar `go.sum` quando há testes com módulos.",
					descriptionTone: "default",
					code: "# O ficheiro é mantido automaticamente por go get / go mod tidy.\n# Não edite hashes à mão.",
					codeLanguage: "shell",
					tags: ["go", "go.sum", "integridade", "checksum", "build"],
				},
				{
					title: "MVS (Minimal Version Selection) em uma frase",
					kicker: "Como o Go escolhe versões",
					description:
						"O algoritmo MVS escolhe a versão **mínima** que satisfaz todos os `require` do grafo, em vez de resolver conflitos como alguns outros ecossistemas. Na prática: listas de `require` explícitas e `go get` controlam o que sobe; surpresas são menos frequentes, mas atualizar uma dependência pode exigir `go get pacote@versao` explícito.",
					descriptionTone: "default",
					code: "# Ver grafo de módulos (útil em conflitos de versão):\ngo mod graph | head",
					codeLanguage: "shell",
					tags: ["go", "mvs", "versao", "grafo", "modulos"],
					callout: {
						type: "hint",
						label: "Opcional:",
						text: "workspaces com `go work` são úteis para vários módulos locais; consulte a documentação oficial quando precisar de monorepo local.",
					},
				},
			],
		},
	],
};
