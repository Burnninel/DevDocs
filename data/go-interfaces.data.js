window.DOC_DATA_REGISTRY = window.DOC_DATA_REGISTRY || {};
window.DOC_DATA_REGISTRY["go-interfaces"] = {
	id: "go-interfaces",
	title: "Go: Interfaces",
	subtitle:
		"Guia prático para satisfação implícita de interfaces, desenho com interfaces pequenas e contratos com io.Reader e io.Writer.",
	searchPlaceholder: "Buscar interface, Reader, Writer, Stringer ou palavra...",
	shortcutHint: "Atalho: pressione / para focar a busca.",
	codeLanguage: "go",
	defaultSectionLayout: "single",
	quickStart: {
		title: "Uma interface e duas implementações",
		kicker: "Satisfação em tempo de compilação",
		description:
			"Em Go não escreves `implements`. Se o tipo tem os métodos certos, já satisfaz a interface. Relembre structs e métodos em `Go: Tipos e valores` no hub.",
		steps: [
			"Crie módulo com `go mod init` (ver `Go: Módulos`).",
			"Cole o exemplo completo em `main.go` e execute `go run .`.",
		],
		codeLanguage: "go",
		code: 'package main\n\nimport "fmt"\n\ntype Greeter interface {\n	Greet() string\n}\n\ntype Formal struct{ Name string }\n\nfunc (f Formal) Greet() string {\n	return "Bom dia, " + f.Name\n}\n\ntype Casual struct{ Name string }\n\nfunc (c Casual) Greet() string {\n	return "Ola " + c.Name\n}\n\nfunc sayHello(g Greeter) {\n	fmt.Println(g.Greet())\n}\n\nfunc main() {\n	sayHello(Formal{Name: "Ana"})\n	sayHello(Casual{Name: "Bruno"})\n}',
		callout: {
			type: "hint",
			label: "Documentação relacionada:",
			text: "exportação de métodos (maiúscula) alinha com `Go: Tipos e valores`.",
		},
	},
	sections: [
		{
			id: "satisfacao-implicita",
			name: "Satisfação implícita",
			layout: "single",
			entries: [
				{
					title: "Interface é conjunto de métodos",
					kicker: "Contrato comportamental",
					description:
						"Uma variável de tipo interface guarda um valor concreto e um tipo dinâmico. Só podes chamar métodos que a interface declara. O compilador verifica se o concreto satisfaz a interface.",
					descriptionTone: "default",
					code: 'package main\n\nimport "fmt"\n\ntype Stringer interface {\n	String() string\n}\n\ntype ID int\n\nfunc (id ID) String() string {\n	return fmt.Sprintf("ID-%d", id)\n}\n\nfunc printLine(s Stringer) {\n	fmt.Println(s.String())\n}\n\nfunc main() {\n	printLine(ID(42))\n}',
					output: "ID-42",
					tags: ["go", "interface", "Stringer", "metodo", "contrato"],
				},
				{
					title: "Interface vazia e any",
					kicker: "Go 1.18+",
					description:
						"`interface{}` significa qualquer valor com qualquer método. O alias predefinido `any` é equivalente. Use com parcimónia: perde-se informação de tipo e costuma exigir type assertion ou `switch` por tipo.",
					descriptionTone: "warn",
					code: 'package main\n\nimport "fmt"\n\nfunc describe(v any) {\n	fmt.Printf("tipo=%T valor=%v\\n", v, v)\n}\n\nfunc main() {\n	describe(10)\n	describe("texto")\n}',
					output: "tipo=int valor=10\ntipo=string valor=texto",
					tags: ["go", "any", "interface{}", "tipo"],
				},
			],
		},
		{
			id: "io-reader-writer",
			name: "io.Reader e io.Writer",
			layout: "single",
			entries: [
				{
					title: "Reader como contrato de leitura",
					kicker: "Streams e bytes",
					description:
						"`io.Reader` declara `Read([]byte) (int, error)`. Muitas APIs aceitam `Reader` em vez de ficheiros concretos, o que facilita testes com `bytes.Reader` ou `strings.Reader`.",
					descriptionTone: "default",
					code: 'package main\n\nimport (\n	"fmt"\n	"io"\n	"strings"\n)\n\nfunc main() {\n	r := strings.NewReader("abc")\n	buf := make([]byte, 2)\n	n, err := r.Read(buf)\n	if err != nil && err != io.EOF {\n		panic(err)\n	}\n	fmt.Println(n, string(buf[:n]))\n}',
					output: "2 ab",
					tags: ["go", "io.Reader", "Read", "strings", "stream"],
					callout: {
						type: "hint",
						label: "Erros e EOF:",
						text: "o padrão `(n, err)` e `io.EOF` ligam a `Go: Erros` no hub.",
					},
				},
				{
					title: "Writer e composição",
					kicker: "Escrever para buffer ou rede",
					description:
						"`io.Writer` define `Write([]byte) (int, error)`. `fmt.Fprintf` escreve formato para qualquer `Writer`, incluindo `os.Stdout` ou `bytes.Buffer`.",
					descriptionTone: "default",
					code: 'package main\n\nimport (\n	"bytes"\n	"fmt"\n)\n\nfunc main() {\n	var buf bytes.Buffer\n	fmt.Fprintf(&buf, "total=%d", 3)\n	fmt.Println(buf.String())\n}',
					output: "total=3",
					tags: ["go", "io.Writer", "Fprintf", "bytes.Buffer"],
				},
			],
		},
		{
			id: "desenho-interfaces",
			name: "Boas práticas de desenho",
			layout: "single",
			entries: [
				{
					title: "Aceite interfaces, devolva structs concretas",
					kicker: "Proverbio útil",
					description:
						"Funções públicas costumam receber interfaces estreitas (`io.Reader`, `context.Context`) e devolver structs concretos ou `(T, error)`. Isso reduz acoplamento e facilita evoluir implementações.",
					descriptionTone: "default",
					code: 'package main\n\nimport "bytes"\n\nfunc NewBuffer() *bytes.Buffer {\n	return new(bytes.Buffer)\n}\n\nfunc main() {\n	_ = NewBuffer()\n}',
					tags: ["go", "interface", "acoplamento", "api", "design"],
				},
				{
					title: "Interfaces pequenas",
					kicker: "Um ou dois métodos por contrato",
					description:
						"Interfaces grandes são difíceis de implementar e testar. Prefira compor: várias interfaces pequenas somam o mesmo poder com mais clareza.",
					descriptionTone: "default",
					code: 'package main\n\ntype Reader interface {\n	Read(p []byte) (n int, err error)\n}\n\ntype Closer interface {\n	Close() error\n}\n\n// ReadCloser combina os dois contratos.\ntype ReadCloser interface {\n	Reader\n	Closer\n}\n\nfunc main() {}\n',
					tags: ["go", "interface", "composicao", "ReadCloser"],
				},
			],
		},
	],
};
