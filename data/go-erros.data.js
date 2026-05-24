window.DOC_DATA_REGISTRY = window.DOC_DATA_REGISTRY || {};
window.DOC_DATA_REGISTRY["go-erros"] = {
	id: "go-erros",
	title: "Go: Erros",
	subtitle:
		"Guia prático para modelar falhas com o tipo error, wrapping com fmt.Errorf, errors.Is e errors.As, e quando evitar panic.",
	searchPlaceholder: "Buscar error, wrap, errors.Is, panic ou palavra...",
	shortcutHint: "Atalho: pressione / para focar a busca.",
	codeLanguage: "go",
	defaultSectionLayout: "single",
	quickStart: {
		title: "Testar exemplos desta página",
		kicker: "Go instalado",
		description:
			"Os trechos são pacotes `main` completos. Guarde cada bloco em `main.go` dentro de um módulo (`go mod init ...`) e execute `go run .`.",
		steps: [
			"Confirme `go version`.",
			"Crie pasta, `go mod init exemplo.local/erros-demo`, cole um exemplo, `go run .`.",
		],
		codeLanguage: "shell",
		code: "go version\ngo mod init exemplo.local/erros-demo\ngo run .",
		callout: {
			type: "hint",
			label: "Documentação relacionada:",
			text: "valores nil e funções que devolvem `(T, error)` combinam com `Go: Tipos e valores` no hub.",
		},
	},
	sections: [
		{
			id: "error-basico",
			name: "O tipo error e nil",
			layout: "single",
			entries: [
				{
					title: "errors.New e fmt.Errorf",
					kicker: "Mensagens simples",
					description:
						"`error` é uma interface com método `Error() string`. `errors.New` cria um erro constante. `fmt.Errorf` formata mensagens; com `%w` podes encadear (wrap) outro erro.",
					descriptionTone: "default",
					code: 'package main\n\nimport (\n	"errors"\n	"fmt"\n)\n\nfunc main() {\n	e := errors.New("falha base")\n	fmt.Println(e)\n	fmt.Println(fmt.Errorf("contexto: %w", e))\n}',
					output: "falha base\ncontexto: falha base",
					tags: ["go", "error", "errors.New", "fmt.Errorf", "interface"],
				},
				{
					title: "Padrão (T, error) e if err != nil",
					kicker: "Fluxo explícito",
					description:
						"Funções que podem falhar devolvem `error` como último valor. O chamador compara com `nil`. Não há exceções genéricas; o fluxo é linear e visível.",
					descriptionTone: "default",
					code: 'package main\n\nimport (\n	"errors"\n	"fmt"\n)\n\nfunc parseId(s string) (int, error) {\n	if s == "" {\n		return 0, errors.New("id vazio")\n	}\n	return 10, nil\n}\n\nfunc main() {\n	if _, err := parseId(""); err != nil {\n		fmt.Println("erro:", err)\n		return\n	}\n	fmt.Println("ok")\n}',
					output: "erro: id vazio",
					tags: ["go", "error", "nil", "if err", "idioma"],
				},
			],
		},
		{
			id: "wrap-is-as",
			name: "Wrapping, Is e As",
			layout: "single",
			entries: [
				{
					title: "fmt.Errorf com %w",
					kicker: "Preservar erro de origem",
					description:
						"Use `%w` apenas uma vez por `fmt.Errorf` e com um único erro wrapável. Cadeias permitem que `errors.Is` e `errors.As` encontrem o erro sentinela ou um tipo concreto no fundo da pilha.",
					descriptionTone: "default",
					code: 'package main\n\nimport (\n	"errors"\n	"fmt"\n)\n\nvar ErrNotFound = errors.New("não encontrado")\n\nfunc load() error {\n	return fmt.Errorf("camada db: %w", ErrNotFound)\n}\n\nfunc main() {\n	err := load()\n	fmt.Println(errors.Is(err, ErrNotFound))\n}',
					output: "true",
					tags: ["go", "wrap", "fmt.Errorf", "errors.Is", "sentinela"],
				},
				{
					title: "errors.As para tipos customizados",
					kicker: "Inspecionar struct de erro",
					description:
						"`errors.As` percorre a cadeia e preenche o destino se algum erro implementa o tipo. Útil para ler campos (código HTTP, código interno) sem depender só da string.",
					descriptionTone: "default",
					code: 'package main\n\nimport (\n	"errors"\n	"fmt"\n)\n\ntype HTTPError struct {\n	Status int\n}\n\nfunc (e HTTPError) Error() string {\n	return fmt.Sprintf("http %d", e.Status)\n}\n\nfunc main() {\n	err := HTTPError{Status: 404}\n	var he HTTPError\n	if errors.As(err, &he) {\n		fmt.Println(he.Status)\n	}\n}',
					output: "404",
					tags: ["go", "errors.As", "tipo", "http"],
				},
			],
		},
		{
			id: "panic-defer",
			name: "panic, recover e boas práticas",
			layout: "single",
			entries: [
				{
					title: "Quando panic é aceitável",
					kicker: "Programação defensiva, não fluxo normal",
					description:
						"`panic` interrompe a goroutine atual. Use para invariantes que nunca deveriam falhar (bug interno) ou durante init. Em bibliotecas e handlers HTTP, devolva `error` em vez de panic para condições esperadas (validação, I/O).",
					descriptionTone: "warn",
					code: 'package main\n\nimport "fmt"\n\nfunc main() {\n	defer func() {\n		if r := recover(); r != nil {\n			fmt.Println("recovered:", r)\n		}\n	}()\n	panic("bug inesperado")\n}',
					output: "recovered: bug inesperado",
					tags: ["go", "panic", "recover", "boas praticas"],
					callout: {
						type: "danger",
						label: "Evite:",
						text: "usar panic para validação de pedido HTTP ou entrada de utilizador; modele com `error` e status adequado.",
					},
				},
				{
					title: "defer e limpeza com erro",
					kicker: "Fechar recursos",
					description:
						"`defer` empilha chamadas que correm ao sair da função (return ou panic). Combine com funções que devolvem erro para fechar ficheiros; em código avançado, funções nomeadas e `defer` ajudam a sobrescrever o `return err`.",
					descriptionTone: "default",
					code: 'package main\n\nimport (\n	"fmt"\n	"os"\n)\n\nfunc main() {\n	f, err := os.CreateTemp("", "demo")\n	if err != nil {\n		panic(err)\n	}\n	defer os.Remove(f.Name())\n	defer f.Close()\n	fmt.Fprintln(f, "dados")\n	fmt.Println("gravado")\n}',
					output: "gravado",
					tags: ["go", "defer", "os", "limpeza", "recurso"],
				},
			],
		},
	],
};
