window.DOC_DATA_REGISTRY = window.DOC_DATA_REGISTRY || {};
window.DOC_DATA_REGISTRY["go-testing"] = {
	id: "go-testing",
	title: "Go: Testes",
	subtitle:
		"Guia prático para o pacote testing, testes table-driven, t.Helper, filtro -run e servidor HTTP de teste com httptest.",
	searchPlaceholder: "Buscar go test, Test, t.Run, httptest ou palavra...",
	shortcutHint: "Atalho: pressione / para focar a busca.",
	codeLanguage: "go",
	defaultSectionLayout: "single",
	quickStart: {
		title: "Primeiro teste",
		kicker: "Ficheiro *_test.go",
		description:
			"Testes ficam no mesmo pacote (ou `package xxx_test` para testes externos). O nome da função começa por `Test` e recebe `*testing.T`. Para falhas modeladas com `error`, veja `Go: Erros` no hub.",
		steps: [
			"Módulo com `go mod init exemplo.local/demo`.",
			"Crie `sum.go` e `sum_test.go` conforme o exemplo abaixo.",
			"Execute `go test -v .` na pasta do módulo.",
		],
		codeLanguage: "shell",
		code: "go mod init exemplo.local/demo\ngo test -v .",
		callout: {
			type: "hint",
			label: "Documentação relacionada:",
			text: "`go test` compila e executa binários temporários; imports seguem o mesmo módulo que em `Go: Módulos`.",
		},
	},
	sections: [
		{
			id: "basico-testing",
			name: "Pacote testing",
			layout: "single",
			entries: [
				{
					title: "TestSum e go test",
					kicker: "Asserções com Errorf",
					description:
						"`testing.T` oferece `Errorf`, `Fatalf`, `FailNow`, `Helper`, entre outros. `Fatalf` aborta o teste atual; `Errorf` acumula falha e continua.",
					descriptionTone: "default",
					code: "// sum.go\npackage demo\n\nfunc Sum(a, b int) int {\n	return a + b\n}\n\n// sum_test.go\npackage demo\n\nimport \"testing\"\n\nfunc TestSum(t *testing.T) {\n	if got := Sum(2, 3); got != 5 {\n		t.Errorf(\"Sum(2,3) = %d; want 5\", got)\n	}\n}",
					codeLanguage: "go",
					tags: ["go", "testing", "Test", "Errorf", "go test"],
				},
				{
					title: "t.Run para subtestes",
					kicker: "Organizar cenários",
					description:
						"`t.Run(\"nome\", func(t *testing.T){ ... })` cria subtestes com nomes próprios no `-v` e permite filtrar com `-run TestSum/positivo`.",
					descriptionTone: "default",
					code: "// sum_test.go (adicione ao mesmo pacote)\npackage demo\n\nimport \"testing\"\n\nfunc TestSumSub(t *testing.T) {\n	t.Run(\"zeros\", func(t *testing.T) {\n		if Sum(0, 0) != 0 {\n			t.Fatal(\"unexpected\")\n		}\n	})\n}",
					codeLanguage: "go",
					tags: ["go", "t.Run", "subtest", "testing"],
				},
			],
		},
		{
			id: "table-driven",
			name: "Table-driven tests",
			layout: "single",
			entries: [
				{
					title: "Slice de casos e loop",
					kicker: "Padrão idiomático",
					description:
						"Define-se uma struct de caso com entrada e resultado esperado; o loop chama `t.Run` ou usa `t.Errorf` com contexto do caso.",
					descriptionTone: "default",
					code: "package demo\n\nimport \"testing\"\n\nfunc TestAbsTable(t *testing.T) {\n	cases := []struct {\n		in, want int\n	}{\n		{1, 1},\n		{-3, 3},\n		{0, 0},\n	}\n	for _, c := range cases {\n		if got := abs(c.in); got != c.want {\n			t.Errorf(\"abs(%d)=%d want %d\", c.in, got, c.want)\n		}\n	}\n}\n\nfunc abs(x int) int {\n	if x < 0 {\n		return -x\n	}\n	return x\n}",
					codeLanguage: "go",
					tags: ["go", "table test", "testing", "cases"],
				},
				{
					title: "Filtro com -run",
					kicker: "Regex sobre nome do teste",
					description:
						"`go test -run TestAbsTable/zeros` não aplica aqui sem subtests nomeados, mas `-run TestAbsTable` limita execução a esse teste. Útil em suites grandes.",
					descriptionTone: "default",
					code: "go test -v -run TestAbsTable ./...",
					codeLanguage: "shell",
					tags: ["go", "go test", "-run", "regex"],
				},
			],
		},
		{
			id: "helper-httptest",
			name: "t.Helper e httptest",
			layout: "single",
			entries: [
				{
					title: "t.Helper para linhas úteis nas falhas",
					kicker: "Funções de apoio",
					description:
						"Marque helpers com `t.Helper()` no início; o relatório de falha aponta para a linha do chamador em vez da linha dentro do helper.",
					descriptionTone: "default",
					code: "package demo\n\nimport \"testing\"\n\nfunc assertEq(t *testing.T, got, want int) {\n	t.Helper()\n	if got != want {\n		t.Fatalf(\"got %d want %d\", got, want)\n	}\n}\n\nfunc TestWithHelper(t *testing.T) {\n	assertEq(t, 1+1, 2)\n}",
					codeLanguage: "go",
					tags: ["go", "t.Helper", "testing", "stack"],
				},
				{
					title: "httptest.Server para handlers HTTP",
					kicker: "Cliente contra servidor local",
					description:
						"`httptest.NewServer` sobe um `http.Server` com listener em porta efémera. Use `defer srv.Close()` e `srv.URL` em `http.Get`. Combine com `Go: JSON` quando o handler devolve JSON.",
					descriptionTone: "default",
					code: 'package demo\n\nimport (\n	"io"\n	"net/http"\n	"net/http/httptest"\n	"testing"\n)\n\nfunc TestPing(t *testing.T) {\n	h := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {\n		w.WriteHeader(http.StatusOK)\n		_, _ = io.WriteString(w, "pong")\n	})\n	srv := httptest.NewServer(h)\n	t.Cleanup(srv.Close)\n\n	resp, err := http.Get(srv.URL)\n	if err != nil {\n		t.Fatal(err)\n	}\n	defer resp.Body.Close()\n	if resp.StatusCode != http.StatusOK {\n		t.Fatalf("status %d", resp.StatusCode)\n	}\n}\n',
					codeLanguage: "go",
					tags: ["go", "httptest", "http", "testing", "Server"],
					callout: {
						type: "hint",
						label: "Go 1.14+:",
						text: "`t.Cleanup` regista funções a correr ao fim do teste (substitui muitos `defer` manuais).",
					},
				},
			],
		},
	],
};
