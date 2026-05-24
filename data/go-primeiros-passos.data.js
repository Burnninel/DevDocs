window.DOC_DATA_REGISTRY = window.DOC_DATA_REGISTRY || {};
window.DOC_DATA_REGISTRY["go-primeiros-passos"] = {
	id: "go-primeiros-passos",
	title: "Go: Primeiros passos",
	subtitle:
		"Guia prático para começar com pacotes, função main, imports, saída com fmt e os comandos essenciais da ferramenta go.",
	searchPlaceholder: "Buscar package main, import, fmt, go run ou palavra...",
	shortcutHint: "Atalho: pressione / para focar a busca.",
	codeLanguage: "go",
	defaultSectionLayout: "single",
	quickStart: {
		title: "Primeiro programa em Go",
		kicker: "Instalação e execução",
		description:
			"Instale Go a partir do site oficial (golang.org/dl). Este guia assume Go 1.21 ou superior no PATH.",
		steps: [
			"Confirme com `go version`.",
			"Crie uma pasta e um ficheiro `main.go` com `package main` e `func main()`.",
			"Dentro da pasta, execute `go mod init exemplo.local/hello` (ajuste o caminho do módulo).",
			"Execute `go run .` e confirme a saída no terminal.",
		],
		codeLanguage: "shell",
		code: "go version\ngo mod init exemplo.local/hello\ngo run .",
		callout: {
			type: "hint",
			label: "Documentação relacionada:",
			text: "para entender `go mod init` e o ficheiro `go.mod`, abra `Go: Módulos` no hub.",
		},
	},
	sections: [
		{
			id: "pacotes-e-main",
			name: "Pacotes e ponto de entrada",
			layout: "single",
			entries: [
				{
					title: "package main e func main",
					kicker: "Programa executável",
					description:
						"Um binário Go começa no pacote `main` com uma função `main` sem argumentos nem retorno. Outros pacotes exportam bibliotecas; só `main` gera executável com `go build`.",
					descriptionTone: "default",
					code: 'package main\n\nimport "fmt"\n\nfunc main() {\n	fmt.Println("Olá, Go")\n}',
					output: "Olá, Go",
					tags: ["go", "package", "main", "func", "executavel", "inicio"],
				},
				{
					title: "Imports e caminho do pacote",
					kicker: "Reutilizar a biblioteca padrão",
					description:
						"O bloco `import` lista pacotes cujo caminho identifica o código (por exemplo `fmt` da stdlib). Um import por linha ou bloco com parênteses. Imports não usados são erro de compilação — o compilador força código limpo.",
					descriptionTone: "default",
					code: 'package main\n\nimport (\n	"fmt"\n	"strings"\n)\n\nfunc main() {\n	fmt.Println(strings.ToUpper("devdocs"))\n}',
					output: "DEVDOCS",
					tags: ["go", "import", "fmt", "strings", "stdlib"],
				},
			],
		},
		{
			id: "fmt-e-saida",
			name: "Saída com fmt",
			layout: "single",
			entries: [
				{
					title: "Println, Printf e verbos",
					kicker: "Formatar texto no terminal",
					description:
						"`Println` escreve valores separados por espaço e quebra de linha. `Printf` usa verbos como `%s`, `%d`, `%v` e `%%` para o símbolo `%`.",
					descriptionTone: "default",
					code: 'package main\n\nimport "fmt"\n\nfunc main() {\n	nome := "Ana"\n	fmt.Printf("Olá, %s (codigo=%d)\\n", nome, 200)\n}',
					output: "Olá, Ana (codigo=200)",
					tags: ["go", "fmt", "printf", "println", "formatacao"],
				},
				{
					title: "Sprintf para construir string",
					kicker: "Sem escrever direto no stdout",
					description:
						"`fmt.Sprintf` devolve uma `string` formatada; útil para mensagens, testes ou montar valores antes de enviar por HTTP (combine depois com `Go: JSON` quando existir).",
					descriptionTone: "default",
					code: 'package main\n\nimport "fmt"\n\nfunc main() {\n	msg := fmt.Sprintf("total=%.2f", 19.9)\n	fmt.Println(msg)\n}',
					output: "total=19.90",
					tags: ["go", "fmt", "sprintf", "string"],
				},
			],
		},
		{
			id: "ferramenta-go",
			name: "Ferramenta go no terminal",
			layout: "single",
			entries: [
				{
					title: "go run e go build",
					kicker: "Executar ou gerar binário",
					description:
						"`go run .` compila e executa o pacote na pasta atual. `go build` gera um executável com o nome da pasta (ou `-o caminho` para definir o ficheiro). Ambos respeitam o `go.mod` do módulo.",
					descriptionTone: "default",
					code: "# Na pasta do módulo (com go.mod e main.go):\ngo run .\n# Binário na pasta atual:\ngo build -o hello.exe .",
					codeLanguage: "shell",
					tags: ["go", "go run", "go build", "terminal", "compilacao"],
					callout: {
						type: "hint",
						label: "Lembrete:",
						text: "sem `go.mod` na pasta ou acima, comandos como `go run` pedem `go mod init` primeiro.",
					},
				},
				{
					title: "go fmt e legibilidade",
					kicker: "Formato oficial",
					description:
						"`go fmt ./...` aplica o estilo canónico ao código. Equipas costumam exigir fmt antes de commit; o formatter remove debates de estilo.",
					descriptionTone: "default",
					code: "# Formatar todos os pacotes sob o módulo atual:\ngo fmt ./...",
					codeLanguage: "shell",
					tags: ["go", "go fmt", "formatacao", "estilo"],
				},
				{
					title: "go doc no terminal",
					kicker: "Ler documentação da stdlib",
					description:
						"`go doc fmt.Println` mostra a assinatura e comentários do símbolo. Ajuda a aprender APIs sem sair do terminal.",
					descriptionTone: "default",
					code: "go doc fmt.Println",
					codeLanguage: "shell",
					tags: ["go", "go doc", "documentacao", "stdlib"],
				},
			],
		},
	],
};
