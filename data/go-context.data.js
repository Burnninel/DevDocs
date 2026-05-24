window.DOC_DATA_REGISTRY = window.DOC_DATA_REGISTRY || {};
window.DOC_DATA_REGISTRY["go-context"] = {
	id: "go-context",
	title: "Go: Context",
	subtitle:
		"Guia prático para context.Context: cancelamento, prazos, valores e ligação a pedidos HTTP e trabalho em background.",
	searchPlaceholder: "Buscar WithCancel, WithTimeout, Deadline, Done ou palavra...",
	shortcutHint: "Atalho: pressione / para focar a busca.",
	codeLanguage: "go",
	defaultSectionLayout: "single",
	quickStart: {
		title: "Prazo curto com WithTimeout",
		kicker: "Cancelar trabalho a meio",
		description:
			"`context.Context` propaga cancelamento e deadlines por uma árvore de chamadas. Em HTTP, prefira sempre `r.Context()` ao criar contextos novos sem necessidade (ver `Go: HTTP` no hub).",
		steps: [
			"Módulo com `go mod init` (ver `Go: Módulos`).",
			"Cole o exemplo em `main.go` e execute `go run .`.",
		],
		codeLanguage: "go",
		code: 'package main\n\nimport (\n	"context"\n	"fmt"\n	"time"\n)\n\nfunc main() {\n	ctx, cancel := context.WithTimeout(context.Background(), time.Millisecond)\n	defer cancel()\n	<-ctx.Done()\n	fmt.Println(ctx.Err())\n}',
		output: "context deadline exceeded",
		callout: {
			type: "hint",
			label: "Documentação relacionada:",
			text: "goroutines longas devem respeitar `ctx.Done()`; veja `Go: Concorrência` no hub.",
		},
	},
	sections: [
		{
			id: "background-cancel",
			name: "Background, cancelamento e prazos",
			layout: "single",
			entries: [
				{
					title: "Background e TODO",
					kicker: "Raiz da árvore",
					description:
						"`context.Background()` devolve um contexto vazio sem deadline, usado em `main`, init e testes de topo. `context.TODO()` sinaliza que ainda não sabes qual contexto propagar — evite deixar `TODO` permanente.",
					descriptionTone: "default",
					code: 'package main\n\nimport (\n	"context"\n	"fmt"\n)\n\nfunc main() {\n	ctx := context.Background()\n	fmt.Println(ctx.Err())\n}',
					output: "<nil>",
					tags: ["go", "context", "Background", "TODO", "raiz"],
				},
				{
					title: "WithCancel e propagação",
					kicker: "Cancelar filhos",
					description:
						"Chamar a função `cancel()` devolve `ctx.Done()` fechado a todos os descendentes criados com `WithCancel`, `WithTimeout` ou `WithDeadline` a partir desse nó.",
					descriptionTone: "default",
					code: 'package main\n\nimport (\n	"context"\n	"fmt"\n)\n\nfunc main() {\n	ctx, cancel := context.WithCancel(context.Background())\n	cancel()\n	<-ctx.Done()\n	fmt.Println(ctx.Err())\n}',
					output: "context canceled",
					tags: ["go", "context", "WithCancel", "Done", "cancel"],
				},
			],
		},
		{
			id: "valores-context",
			name: "WithValue e armadilhas",
			layout: "single",
			entries: [
				{
					title: "WithValue para dados de pedido",
					kicker: "Chaves não exportadas",
					description:
						"Use tipos privados como chaves (`type ctxKey struct{}`) para evitar colisões entre pacotes. Valores devem ser imutáveis ou cópias defensivas — não coloques ponteiros mutáveis partilhados como valor de contexto.",
					descriptionTone: "warn",
					code: 'package main\n\nimport (\n	"context"\n	"fmt"\n)\n\ntype ctxKeyUser struct{}\n\nfunc main() {\n	ctx := context.WithValue(context.Background(), ctxKeyUser{}, "Ana")\n	fmt.Println(ctx.Value(ctxKeyUser{}))\n}',
					output: "Ana",
					tags: ["go", "context", "WithValue", "chave", "pedido"],
					callout: {
						type: "danger",
						label: "Evite:",
						text: "passar `*sql.DB`, caches mutáveis ou logger com estado pelo `WithValue`; isso esconde dependências e dificulta testes.",
					},
				},
				{
					title: "Ligar contexto a HTTP",
					kicker: "Request.Context",
					description:
						"Em handlers, use `ctx := r.Context()` para respeitar cancelamento do cliente ou timeouts do servidor. `http.NewRequestWithContext` associa o contexto ao pedido de saída (detalhes em `Go: HTTP` no hub).",
					descriptionTone: "default",
					code: 'package main\n\nimport (\n	"context"\n	"fmt"\n	"net/http"\n)\n\nfunc main() {\n	ctx, cancel := context.WithCancel(context.Background())\n	cancel()\n	req, err := http.NewRequestWithContext(ctx, http.MethodGet, "http://example.invalid/", nil)\n	if err != nil {\n		panic(err)\n	}\n	fmt.Println(req.Context().Err())\n}',
					output: "context canceled",
					tags: ["go", "context", "http", "Request", "cliente"],
				},
			],
		},
	],
};
