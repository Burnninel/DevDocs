window.DOC_DATA_REGISTRY = window.DOC_DATA_REGISTRY || {};
window.DOC_DATA_REGISTRY["go-time"] = {
	id: "go-time",
	title: "Go: Tempo (time)",
	subtitle:
		"Guia prático para time.Time em UTC, formatar com layouts, Duration, Since e nota sobre relógio monotónico.",
	searchPlaceholder: "Buscar RFC3339, UTC, Duration, Parse ou palavra...",
	shortcutHint: "Atalho: pressione / para focar a busca.",
	codeLanguage: "go",
	defaultSectionLayout: "single",
	quickStart: {
		title: "Instante fixo em UTC",
		kicker: "Evitar surpresas de fuso",
		description:
			"Guarde instantes na base de dados em UTC (`time.RFC3339`). Converta para fuso local só na apresentação. Combine com APIs HTTP em `Go: HTTP` e JSON em `Go: JSON`.",
		steps: [
			"Módulo com `go mod init`.",
			"Cole o exemplo em `main.go` e `go run .`.",
		],
		codeLanguage: "go",
		code: 'package main\n\nimport (\n	"fmt"\n	"time"\n)\n\nfunc main() {\n	t := time.Date(2026, 5, 9, 12, 0, 0, 0, time.UTC)\n	fmt.Println(t.Format(time.RFC3339))\n}',
		output: "2026-05-09T12:00:00Z",
		callout: {
			type: "hint",
			label: "Layouts:",
			text: "a referência de formatação em Go é o instante `Mon Jan 2 15:04:05 MST 2006`; use constantes como `time.RFC3339` sempre que possível.",
		},
	},
	sections: [
		{
			id: "parse-duracao",
			name: "Parse e Duration",
			layout: "single",
			entries: [
				{
					title: "time.Parse em UTC explícito",
					kicker: "Fuso ambíguo sem monotonic",
					description:
						"`time.Parse` usa UTC se a string não trouxer offset. Para strings com fuso, o instante resultante ajusta-se. Valide formatos de entrada de utilizadores.",
					descriptionTone: "default",
					code: 'package main\n\nimport (\n	"fmt"\n	"time"\n)\n\nfunc main() {\n	t, err := time.Parse(time.RFC3339, "2026-05-09T12:00:00Z")\n	if err != nil {\n		panic(err)\n	}\n	fmt.Println(t.UTC().Hour())\n}',
					output: "12",
					tags: ["go", "time", "Parse", "UTC", "RFC3339"],
				},
				{
					title: "Duration e Sleep",
					kicker: "Multiplicadores de unidade",
					description:
						"Literais como `500 * time.Millisecond` ou `parseDuration, err := time.ParseDuration(\"2h30m\")` evitam números mágicos em nanosegundos.",
					descriptionTone: "default",
					code: 'package main\n\nimport (\n	"fmt"\n	"time"\n)\n\nfunc main() {\n	d, err := time.ParseDuration("1500ms")\n	if err != nil {\n		panic(err)\n	}\n	fmt.Println(d == 1500*time.Millisecond)\n}',
					output: "true",
					tags: ["go", "Duration", "ParseDuration", "Sleep"],
				},
			],
		},
		{
			id: "since-monotonic",
			name: "Since, Sub e monotónico",
			layout: "single",
			entries: [
				{
					title: "Since e Sub para intervalos",
					kicker: "Medir duração decorrida",
					description:
						"`time.Since(t)` é açúcar sintático para `time.Now().Sub(t)`. `t.Sub(u)` devolve `Duration` assinada entre dois instantes.",
					descriptionTone: "default",
					code: 'package main\n\nimport (\n	"fmt"\n	"time"\n)\n\nfunc main() {\n	start := time.Now()\n	time.Sleep(5 * time.Millisecond)\n	fmt.Println(time.Since(start) >= 5*time.Millisecond)\n}',
					output: "true",
					tags: ["go", "Since", "Sub", "Duration", "medicao"],
				},
				{
					title: "Relógio monotónico e comparações",
					kicker: "Detalhe interno útil",
					description:
						"`time.Time` pode incluir um relógio monotónico para medir intervalos sem saltos quando o relógio de parede é ajustado (NTP). Comparações (`Before`, `After`) usam ambos os relógios de forma segura; não dependas de `UnixNano` para ordenar instantes de wall clock distantes sem ler a documentação oficial.",
					descriptionTone: "warn",
					code: 'package main\n\nimport (\n	"fmt"\n	"time"\n)\n\nfunc main() {\n	a := time.Now()\n	b := a.Add(2 * time.Second)\n	fmt.Println(b.After(a))\n}',
					output: "true",
					tags: ["go", "time", "monotonic", "Before", "After"],
				},
			],
		},
	],
};
