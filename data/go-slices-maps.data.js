window.DOC_DATA_REGISTRY = window.DOC_DATA_REGISTRY || {};
window.DOC_DATA_REGISTRY["go-slices-maps"] = {
	id: "go-slices-maps",
	title: "Go: Slices e maps",
	subtitle:
		"Guia prático para slices e arrays, append e capacidade, partilha de backing array, maps e o idiom vírgula-ok.",
	searchPlaceholder: "Buscar slice, append, map, range, cap ou palavra...",
	shortcutHint: "Atalho: pressione / para focar a busca.",
	codeLanguage: "go",
	defaultSectionLayout: "single",
	quickStart: {
		title: "Slice e map no mesmo main",
		kicker: "len, cap e chave inexistente",
		description:
			"Slices referenciam um array subjacente; maps são tabelas hash. Relembre valores zero em `Go: Tipos e valores` no hub.",
		steps: [
			"Módulo com `go mod init` (ver `Go: Módulos`).",
			"Cole o exemplo em `main.go` e execute `go run .`.",
		],
		codeLanguage: "go",
		code: 'package main\n\nimport "fmt"\n\nfunc main() {\n	nomes := []string{"Ana", "Bruno"}\n	fmt.Println(len(nomes), cap(nomes))\n\n	idades := map[string]int{"Ana": 30}\n	idades["Bruno"] = 28\n	fmt.Println(idades["Ana"], idades["Carla"])\n}',
		callout: {
			type: "warn",
			label: "Map sem chave:",
			text: "ler `idades[\"Carla\"]` devolve zero value (0 para int); use o idiom vírgula-ok para distinguir ausente de zero legítimo.",
		},
	},
	sections: [
		{
			id: "arrays-e-slices",
			name: "Arrays e slices",
			layout: "single",
			entries: [
				{
					title: "Array com tamanho fixo versus slice",
					kicker: "[n]T versus []T",
					description:
						"`[3]int` tem tamanho parte do tipo; `[3]int` e `[4]int` são tipos diferentes. `[]int` é um slice: tamanho dinâmico, referência a backing array e metadados len/cap.",
					descriptionTone: "default",
					code: 'package main\n\nimport "fmt"\n\nfunc main() {\n	var a [2]int\n	a[0] = 1\n	s := []int{10, 20, 30}\n	fmt.Println(a, len(s), cap(s))\n}',
					output: "[1 0] 3 3",
					tags: ["go", "array", "slice", "len", "cap"],
				},
				{
					title: "append e crescimento",
					kicker: "Pode realocar",
					description:
						"`append` devolve um slice novo ou o mesmo, consoante haja capacidade livre. Guarde sempre o retorno: `s = append(s, x)`. Quando `cap` dobra, o runtime pode copiar elementos para um array maior.",
					descriptionTone: "default",
					code: 'package main\n\nimport "fmt"\n\nfunc main() {\n	s := make([]int, 0, 2)\n	s = append(s, 1)\n	fmt.Println(len(s), cap(s))\n	s = append(s, 2, 3)\n	fmt.Println(len(s), cap(s), s)\n}',
					output: "1 2\n3 4 [1 2 3]",
					tags: ["go", "append", "slice", "cap", "realocacao"],
				},
			],
		},
		{
			id: "partilha-backing",
			name: "Partilha do backing array",
			layout: "single",
			entries: [
				{
					title: "Re-slice do mesmo array subjacente",
					kicker: "Mudança visível noutro slice",
					description:
						"Dois slices podem partilhar elementos. Alterar um índice visível noutro pode surpreender. Use `copy` ou `append` a um slice novo para isolar quando necessário.",
					descriptionTone: "warn",
					code: 'package main\n\nimport "fmt"\n\nfunc main() {\n	base := []int{1, 2, 3, 4}\n	a := base[0:2]\n	b := base[1:3]\n	b[0] = 99\n	fmt.Println(a, b)\n}',
					output: "[1 99] [99 3]",
					tags: ["go", "slice", "backing", "copy", "alias"],
				},
				{
					title: "copy para desanuviar",
					kicker: "Slice independente",
					description:
						"`copy(dst, src)` copia o mínimo entre len(dst) e len(src). Combinado com `make` cria uma região de memória separada.",
					descriptionTone: "default",
					code: 'package main\n\nimport "fmt"\n\nfunc main() {\n	src := []int{1, 2, 3}\n	dst := make([]int, len(src))\n	copy(dst, src)\n	dst[0] = 9\n	fmt.Println(src, dst)\n}',
					output: "[1 2 3] [9 2 3]",
					tags: ["go", "copy", "make", "slice"],
				},
			],
		},
		{
			id: "maps",
			name: "Maps",
			layout: "single",
			entries: [
				{
					title: "make e literal",
					kicker: "map[K]V",
					description:
						"O zero value de um map é `nil`; escrever nele panic. Use `make(map[string]int)` ou literal `map[string]int{}` antes de atribuir chaves.",
					descriptionTone: "default",
					code: 'package main\n\nimport "fmt"\n\nfunc main() {\n	m := make(map[string]int)\n	m["um"] = 1\n	fmt.Println(m["um"])\n}',
					output: "1",
					tags: ["go", "map", "make", "chave"],
				},
				{
					title: "Vírgula-ok e delete",
					kicker: "Existência de chave",
					description:
						"`v, ok := m[\"k\"]` distingue chave ausente de valor zero. `delete(m, \"k\")` remove a entrada. A ordem de `range` em maps não é definida — não dependas dela.",
					descriptionTone: "default",
					code: 'package main\n\nimport "fmt"\n\nfunc main() {\n	m := map[string]int{"a": 0}\n	v, ok := m["a"]\n	fmt.Println("a", v, ok)\n	_, ok2 := m["b"]\n	fmt.Println("b", ok2)\n	delete(m, "a")\n	fmt.Println(len(m))\n}',
					output: "a 0 true\nb false\n0",
					tags: ["go", "map", "ok", "delete", "range"],
					callout: {
						type: "hint",
						label: "Iteração:",
						text: "não assumes ordem estável entre execuções; para ordenação explícita, extraia chaves e ordene (por exemplo com sort.Strings).",
					},
				},
			],
		},
	],
};
