window.DOC_DATA_REGISTRY = window.DOC_DATA_REGISTRY || {};
window.DOC_DATA_REGISTRY["go-json"] = {
	id: "go-json",
	title: "Go: JSON",
	subtitle:
		"Guia prático para json.Marshal e json.Unmarshal, tags em structs, omitempty, json.RawMessage e falhas de decode.",
	searchPlaceholder: "Buscar Marshal, Unmarshal, omitempty, RawMessage ou palavra...",
	shortcutHint: "Atalho: pressione / para focar a busca.",
	codeLanguage: "go",
	defaultSectionLayout: "single",
	quickStart: {
		title: "Objeto Go para JSON e volta",
		kicker: "encoding/json",
		description:
			"Structs com campos exportados (maiúscula) mapeiam para chaves JSON. Combine com `Go: Tipos e valores` no hub.",
		steps: [
			"Módulo com `go mod init`.",
			"Cole o exemplo em `main.go` e `go run .`.",
		],
		codeLanguage: "go",
		code: 'package main\n\nimport (\n	"encoding/json"\n	"fmt"\n)\n\ntype User struct {\n	Name string `json:"name"`\n	Age  int    `json:"age"`\n}\n\nfunc main() {\n	u := User{Name: "Ana", Age: 31}\n	b, err := json.Marshal(u)\n	if err != nil {\n		panic(err)\n	}\n	fmt.Println(string(b))\n\n	var out User\n	if err := json.Unmarshal(b, &out); err != nil {\n		panic(err)\n	}\n	fmt.Println(out.Name, out.Age)\n}',
		callout: {
			type: "hint",
			label: "Erros:",
			text: "o padrão `(T, error)` em `Marshal` e `Unmarshal` alinha com `Go: Erros` no hub.",
		},
	},
	sections: [
		{
			id: "marshal-unmarshal",
			name: "Marshal e Unmarshal",
			layout: "single",
			entries: [
				{
					title: "MarshalIndent para depuração",
					kicker: "JSON legível",
					description:
						"`json.Marshal` produz bytes compactos. `json.MarshalIndent` adiciona prefixo e indentação úteis em logs ou respostas de desenvolvimento.",
					descriptionTone: "default",
					code: 'package main\n\nimport (\n	"encoding/json"\n	"fmt"\n)\n\nfunc main() {\n	m := map[string]any{"ok": true, "n": 1}\n	b, err := json.MarshalIndent(m, "", "  ")\n	if err != nil {\n		panic(err)\n	}\n	fmt.Println(string(b))\n}',
					output: "{\n  \"n\": 1,\n  \"ok\": true\n}",
					tags: ["go", "json", "MarshalIndent", "map"],
				},
				{
					title: "Decoder com DisallowUnknownFields",
					kicker: "Rejeitar chaves extra",
					description:
						"Por omissão `json.Unmarshal` ignora chaves desconhecidas. Para APIs estritas, use `json.NewDecoder` com `DisallowUnknownFields(true)` antes de `Decode`.",
					descriptionTone: "default",
					code: 'package main\n\nimport (\n	"bytes"\n	"encoding/json"\n	"fmt"\n)\n\nfunc main() {\n	raw := []byte(`{"name":"Ana","extra":1}`)\n	dec := json.NewDecoder(bytes.NewReader(raw))\n	dec.DisallowUnknownFields()\n	var v struct {\n		Name string `json:"name"`\n	}\n	err := dec.Decode(&v)\n	fmt.Println(err)\n}',
					output: "json: unknown field \"extra\"",
					tags: ["go", "json", "Decoder", "validacao", "api"],
				},
			],
		},
		{
			id: "tags-struct",
			name: "Tags e omitempty",
			layout: "single",
			entries: [
				{
					title: "Renomear chaves e omitir vazios",
					kicker: "Struct tags",
					description:
						"A tag `json:\"nome\"` define o nome da chave. `omitempty` omite o campo quando está no zero value (atenção: slice nil omite, slice vazia `[]` não é zero value para omitempty da mesma forma — consulte a documentação oficial para matizes).",
					descriptionTone: "default",
					code: 'package main\n\nimport (\n	"encoding/json"\n	"fmt"\n)\n\ntype Event struct {\n	ID     string `json:"id"`\n	Detail string `json:"detail,omitempty"`\n}\n\nfunc main() {\n	b, _ := json.Marshal(Event{ID: "1"})\n	fmt.Println(string(b))\n}',
					output: `{"id":"1"}`,
					tags: ["go", "json", "omitempty", "tag", "struct"],
				},
				{
					title: "json.RawMessage para adiar decode",
					kicker: "Payload heterogéneo",
					description:
						"`json.RawMessage` é um alias de `[]byte` que implementa `UnmarshalJSON` para guardar JSON bruto. Útil quando o formato interno depende de um campo discriminador.",
					descriptionTone: "default",
					code: 'package main\n\nimport (\n	"encoding/json"\n	"fmt"\n)\n\ntype Envelope struct {\n	Type string          `json:"type"`\n	Data json.RawMessage `json:"data"`\n}\n\nfunc main() {\n	raw := []byte(`{"type":"ping","data":{"seq":1}}`)\n	var env Envelope\n	if err := json.Unmarshal(raw, &env); err != nil {\n		panic(err)\n	}\n	fmt.Println(env.Type, string(env.Data))\n}',
					output: `ping {"seq":1}`,
					tags: ["go", "json", "RawMessage", "decode"],
				},
			],
		},
		{
			id: "erros-json",
			name: "Erros comuns no decode",
			layout: "single",
			entries: [
				{
					title: "Tipos incompatíveis",
					kicker: "string vs número",
					description:
						"JSON trata números de forma fluida; structs com `int` falham se o JSON trouxer string. Ajuste o tipo (`json.Number`, `string`, ou struct custom) ou normalize o payload antes.",
					descriptionTone: "warn",
					code: 'package main\n\nimport (\n	"encoding/json"\n	"fmt"\n)\n\nfunc main() {\n	var v struct {\n		N int `json:"n"`\n	}\n	err := json.Unmarshal([]byte(`{"n":"5"}`), &v)\n	fmt.Println(err)\n}',
					output: "json: cannot unmarshal string into Go struct field .N of type int",
					tags: ["go", "json", "erro", "tipo", "unmarshal"],
				},
				{
					title: "Tratar erro de Unmarshal",
					kicker: "Não ignorar err",
					description:
						"Em handlers HTTP, devolva 400 com mensagem genérica e registe o erro interno. O mesmo espírito de `Go: Erros` aplica-se aqui.",
					descriptionTone: "default",
					code: 'package main\n\nimport (\n	"encoding/json"\n	"fmt"\n)\n\nfunc parse(in []byte) error {\n	var m map[string]int\n	if err := json.Unmarshal(in, &m); err != nil {\n		return fmt.Errorf("parse payload: %w", err)\n	}\n	return nil\n}\n\nfunc main() {\n	err := parse([]byte(`{`))\n	fmt.Println(err)\n}',
					output: "parse payload: unexpected end of JSON input",
					tags: ["go", "json", "wrap", "erro", "handler"],
				},
			],
		},
	],
};
