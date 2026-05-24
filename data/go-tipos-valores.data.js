window.DOC_DATA_REGISTRY = window.DOC_DATA_REGISTRY || {};
window.DOC_DATA_REGISTRY["go-tipos-valores"] = {
	id: "go-tipos-valores",
	title: "Go: Tipos e valores",
	subtitle:
		"Guia prático para valores zero, ponteiros, structs literais, composição e a regra de nomes exportados em Go.",
	searchPlaceholder: "Buscar zero value, ponteiro, struct, exportado ou palavra...",
	shortcutHint: "Atalho: pressione / para focar a busca.",
	codeLanguage: "go",
	defaultSectionLayout: "single",
	quickStart: {
		title: "Tipos básicos no mesmo programa",
		kicker: "Declarar e imprimir",
		description:
			"Use `var` para declarar com tipo explícito ou `:=` dentro de funções para inferência. Compare com valores zero antes de assumir que um campo foi preenchido.",
		steps: [
			"Crie um módulo com `go mod init` (ver `Go: Módulos`).",
			"Cole o exemplo abaixo em `main.go` e execute `go run .`.",
		],
		codeLanguage: "go",
		code: 'package main\n\nimport "fmt"\n\nfunc main() {\n	var i int\n	var s string\n	var p *int\n	fmt.Printf("i=%d s=%q p=%v\\n", i, s, p)\n}',
		callout: {
			type: "hint",
			label: "Documentação relacionada:",
			text: "para erros como valores (`error` pode ser nil), veja `Go: Erros` no hub.",
		},
	},
	sections: [
		{
			id: "zero-values",
			name: "Valores zero",
			layout: "single",
			entries: [
				{
					title: "Zero value por tipo",
					kicker: "Estado inicial seguro",
					description:
						"Tipos têm valor zero: `0` para números, `false` para bool, string vazia para o tipo string, `nil` para ponteiros, slices, maps, canais e interfaces. Structs têm campos no respetivo zero.",
					descriptionTone: "default",
					code: 'package main\n\nimport "fmt"\n\ntype Config struct {\n	Port int\n	Host string\n}\n\nfunc main() {\n	var c Config\n	fmt.Printf("%+v\\n", c)\n}',
					output: "{Port:0 Host:}",
					tags: ["go", "zero value", "struct", "inicializacao"],
				},
				{
					title: "Comparar com zero em vez de \"vazio\" mágico",
					kicker: "Idioma explícito",
					description:
						"Go não tem `undefined` como JavaScript. Para saber se um `int` foi definido semanticamente, use ponteiro, `bool` extra ou um tipo opcional (`sql.NullInt64`, etc.) conforme o domínio.",
					descriptionTone: "default",
					code: 'package main\n\nimport "fmt"\n\nfunc main() {\n	var n int\n	fmt.Println(n == 0)\n}',
					output: "true",
					tags: ["go", "comparacao", "zero", "idioma"],
				},
			],
		},
		{
			id: "ponteiros",
			name: "Ponteiros",
			layout: "single",
			entries: [
				{
					title: "Operador & e *",
					kicker: "Endereço e desreferência",
					description:
						"`&x` obtém o endereço de `x`. `*p` lê ou escreve o valor apontado. Passar ponteiro evita copiar structs grandes e permite funções mutarem estado de forma explícita.",
					descriptionTone: "default",
					code: 'package main\n\nimport "fmt"\n\nfunc dobra(p *int) {\n	*p *= 2\n}\n\nfunc main() {\n	x := 3\n	dobra(&x)\n	fmt.Println(x)\n}',
					output: "6",
					tags: ["go", "ponteiro", "endereco", "referencia"],
				},
				{
					title: "new(T) vs literal &T{}",
					kicker: "Alocação na heap quando escapa",
					description:
						"`new(T)` devolve `*T` com campos em zero. `&Person{Name: \"Ana\"}` cria um valor e já devolve ponteiro. Na prática literais são mais legíveis para structs.",
					descriptionTone: "default",
					code: 'package main\n\nimport "fmt"\n\ntype Person struct {\n	Name string\n}\n\nfunc main() {\n	p := &Person{Name: "Ana"}\n	fmt.Println(p.Name)\n}',
					output: "Ana",
					tags: ["go", "new", "literal", "struct", "ponteiro"],
				},
			],
		},
		{
			id: "structs-e-export",
			name: "Structs e exportação",
			layout: "single",
			entries: [
				{
					title: "Campos e métodos exportados",
					kicker: "Maiúscula inicial = público ao pacote",
					description:
						"Identificadores que começam por maiúscula são exportados (visíveis noutros pacotes). Minúscula fica privado ao pacote. Aplica-se a campos, funções, métodos e tipos.",
					descriptionTone: "default",
					code: 'package main\n\nimport "fmt"\n\ntype Conta struct {\n	Titular string // exportado\n	saldo   int      // privado ao pacote main\n}\n\nfunc (c *Conta) Depositar(v int) {\n	c.saldo += v\n}\n\nfunc (c *Conta) Saldo() int {\n	return c.saldo\n}\n\nfunc main() {\n	c := Conta{Titular: "Bruno"}\n	c.Depositar(10)\n	fmt.Println(c.Titular, c.Saldo())\n}',
					output: "Bruno 10",
					tags: ["go", "exportado", "struct", "encapsulamento", "pacote"],
				},
				{
					title: "Composição em vez de herança clássica",
					kicker: "Struct embutido",
					description:
						"Go não tem `extends`. Incorpora um tipo anónimo para promover métodos e campos (embedding). Use com moderação para não obscurecer onde vem cada método.",
					descriptionTone: "default",
					code: 'package main\n\nimport "fmt"\n\ntype Logger struct{ Prefix string }\n\nfunc (l Logger) Log(msg string) {\n	fmt.Println(l.Prefix + msg)\n}\n\ntype Service struct {\n	Logger\n}\n\nfunc main() {\n	s := Service{Logger: Logger{Prefix: "[svc] "}}\n	s.Log("ok")\n}',
					output: "[svc] ok",
					tags: ["go", "composicao", "embedding", "struct"],
				},
			],
		},
	],
};
