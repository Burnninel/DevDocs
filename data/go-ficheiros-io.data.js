window.DOC_DATA_REGISTRY = window.DOC_DATA_REGISTRY || {};
window.DOC_DATA_REGISTRY["go-ficheiros-io"] = {
	id: "go-ficheiros-io",
	title: "Go: Ficheiros e I/O",
	subtitle:
		"Guia prático para os e io: ler e gravar ficheiros, filepath.Join, os.Open com defer e erros.",
	searchPlaceholder: "Buscar ReadFile, WriteFile, Open, filepath ou palavra...",
	shortcutHint: "Atalho: pressione / para focar a busca.",
	codeLanguage: "go",
	defaultSectionLayout: "single",
	quickStart: {
		title: "Gravar e ler com os",
		kicker: "Ficheiro temporário seguro",
		description:
			"Use `filepath.Join` para compor caminhos portáveis no disco. Trate `(T, error)` como em `Go: Erros` no hub.",
		steps: [
			"Módulo com `go mod init`.",
			"Cole o exemplo em `main.go` e `go run .`.",
		],
		codeLanguage: "go",
		code: 'package main\n\nimport (\n	"fmt"\n	"os"\n	"path/filepath"\n)\n\nfunc main() {\n	dir := os.TempDir()\n	path := filepath.Join(dir, "devdocs-demo.txt")\n	if err := os.WriteFile(path, []byte("ola"), 0o600); err != nil {\n		panic(err)\n	}\n	defer os.Remove(path)\n	b, err := os.ReadFile(path)\n	if err != nil {\n		panic(err)\n	}\n	fmt.Println(string(b))\n}',
		output: "ola",
		callout: {
			type: "hint",
			label: "Permissões:",
			text: "em Unix, `0o600` limita leitura ao dono; em Windows o significado dos bits group/other difere, mas o hábito ajuda portabilidade.",
		},
	},
	sections: [
		{
			id: "open-defer",
			name: "Open, ReadFile e defer",
			layout: "single",
			entries: [
				{
					title: "os.Open com defer Close",
					kicker: "Streams e ficheiros reais",
					description:
						"`os.ReadFile` lê o ficheiro completo (ideal para ficheiros pequenos). Para controlar leituras parciais ou ficheiros grandes, `os.Open` com `Read`/`io.Copy` mantém controlo de memória.",
					descriptionTone: "default",
					code: 'package main\n\nimport (\n	"fmt"\n	"io"\n	"os"\n)\n\nfunc main() {\n	f, err := os.CreateTemp("", "devdocs-")\n	if err != nil {\n		panic(err)\n	}\n	defer os.Remove(f.Name())\n	defer f.Close()\n	if _, err := f.WriteString("abc"); err != nil {\n		panic(err)\n	}\n	if _, err := f.Seek(0, io.SeekStart); err != nil {\n		panic(err)\n	}\n	buf := make([]byte, 4)\n	n, err := f.Read(buf)\n	if err != nil && err != io.EOF {\n		panic(err)\n	}\n	fmt.Println(n, string(buf[:n]))\n}',
					output: "3 abc",
					tags: ["go", "os.Open", "defer", "Read", "ficheiro"],
				},
				{
					title: "os.ReadFile em poucas linhas",
					kicker: "API conveniente",
					description:
						"Desde Go 1.16, `os.ReadFile` substitui o padrão `ioutil.ReadFile`. Devolve `[]byte` completo ou erro; combine com `os.WriteFile` para round-trip simples.",
					descriptionTone: "default",
					code: 'package main\n\nimport (\n	"fmt"\n	"os"\n)\n\nfunc main() {\n	f, err := os.CreateTemp("", "read-")\n	if err != nil {\n		panic(err)\n	}\n	path := f.Name()\n	_ = f.Close()\n	defer os.Remove(path)\n	if err := os.WriteFile(path, []byte("x"), 0o600); err != nil {\n		panic(err)\n	}\n	b, err := os.ReadFile(path)\n	if err != nil {\n		panic(err)\n	}\n	fmt.Println(string(b))\n}',
					output: "x",
					tags: ["go", "ReadFile", "WriteFile", "os", "ficheiro"],
				},
			],
		},
		{
			id: "filepath-io-copy",
			name: "Caminhos e io.Copy",
			layout: "single",
			entries: [
				{
					title: "path.Join para URLs e segmentos lógicos",
					kicker: "Separador sempre /",
					description:
						"O pacote `path` (não `filepath`) junta segmentos com `/` — adequado a rotas HTTP. Para caminhos no disco do SO, use `filepath.Join` (ver `quickStart`).",
					descriptionTone: "default",
					code: 'package main\n\nimport (\n	"fmt"\n	"path"\n)\n\nfunc main() {\n	fmt.Println(path.Join("api", "v1", "users"))\n}',
					output: "api/v1/users",
					tags: ["go", "path", "Join", "url", "rota"],
				},
				{
					title: "io.Copy entre Reader e Writer",
					kicker: "Reutilizar buffers internos",
					description:
						"`io.Copy(dst, src)` move bytes até `EOF` ou erro. Combina com ficheiros, `bytes.Buffer` ou `http.ResponseWriter` (ver `Go: HTTP`).",
					descriptionTone: "default",
					code: 'package main\n\nimport (\n	"bytes"\n	"fmt"\n	"io"\n	"strings"\n)\n\nfunc main() {\n	r := strings.NewReader("abc")\n	var buf bytes.Buffer\n	n, err := io.Copy(&buf, r)\n	if err != nil {\n		panic(err)\n	}\n	fmt.Println(n, buf.String())\n}',
					output: "3 abc",
					tags: ["go", "io.Copy", "Reader", "Writer", "buffer"],
				},
			],
		},
	],
};
