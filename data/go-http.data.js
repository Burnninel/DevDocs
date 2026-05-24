window.DOC_DATA_REGISTRY = window.DOC_DATA_REGISTRY || {};
window.DOC_DATA_REGISTRY["go-http"] = {
	id: "go-http",
	title: "Go: HTTP",
	subtitle:
		"Guia prático para net/http: Handlers, Server com timeouts, cliente com contexto e integração com JSON.",
	searchPlaceholder: "Buscar Handler, ListenAndServe, Client, Request ou palavra...",
	shortcutHint: "Atalho: pressione / para focar a busca.",
	codeLanguage: "go",
	defaultSectionLayout: "single",
	quickStart: {
		title: "Cliente contra servidor de teste",
		kicker: "Sem portas fixas",
		description:
			"Use `httptest.NewServer` para testar handlers sem abrir portas manuais. Corpo JSON combina com `Go: JSON` no hub; prazos com `Go: Context`.",
		steps: [
			"Módulo com `go mod init`.",
			"Cole o exemplo em `main.go` e `go run .`.",
		],
		codeLanguage: "go",
		code: 'package main\n\nimport (\n	"fmt"\n	"io"\n	"net/http"\n	"net/http/httptest"\n)\n\nfunc main() {\n	h := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {\n		w.Header().Set("Content-Type", "text/plain; charset=utf-8")\n		fmt.Fprint(w, "ola")\n	})\n	srv := httptest.NewServer(h)\n	defer srv.Close()\n	resp, err := http.Get(srv.URL)\n	if err != nil {\n		panic(err)\n	}\n	defer resp.Body.Close()\n	body, _ := io.ReadAll(resp.Body)\n	fmt.Println(resp.StatusCode, string(body))\n}',
		output: "200 ola",
		callout: {
			type: "hint",
			label: "Segurança:",
			text: "em produção defina `ReadHeaderTimeout`, `ReadTimeout` e `WriteTimeout` no `http.Server` para evitar clientes lentos (ver secção Servidor).",
		},
	},
	sections: [
		{
			id: "servidor-basico",
			name: "Servidor HTTP",
			layout: "single",
			entries: [
				{
					title: "http.Server com timeouts",
					kicker: "Preferível a ListenAndServe nu",
					description:
						"`http.ListenAndServe` é conveniente mas não expõe timeouts. Um `http.Server` explícito permite `ReadHeaderTimeout` (recomendado desde Go 1.8) e limites de leitura/escrita.",
					descriptionTone: "default",
					code: 'package main\n\nimport (\n	"log"\n	"net/http"\n	"time"\n)\n\nfunc main() {\n	mux := http.NewServeMux()\n	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {\n		w.WriteHeader(http.StatusOK)\n	})\n	srv := &http.Server{\n		Addr:              ":8080",\n		Handler:           mux,\n		ReadHeaderTimeout: 2 * time.Second,\n		ReadTimeout:       5 * time.Second,\n		WriteTimeout:      10 * time.Second,\n		IdleTimeout:       60 * time.Second,\n	}\n	if err := srv.ListenAndServe(); err != nil {\n		log.Fatal(err)\n	}\n}',
					codeLanguage: "go",
					tags: ["go", "http", "Server", "timeout", "ListenAndServe"],
					callout: {
						type: "warn",
						label: "Nota:",
						text: "este exemplo bloqueia em `ListenAndServe`; não o copie tal como está em testes sem goroutine ou `httptest`.",
					},
				},
				{
					title: "Request.Context no handler",
					kicker: "Cancelamento do cliente",
					description:
						"Use `ctx := r.Context()` antes de chamar serviços lentos ou base de dados. Quando o cliente fecha a ligação, `ctx` cancela e podes abortar trabalho (ver `Go: Context`).",
					descriptionTone: "default",
					code: 'package main\n\nimport (\n	"fmt"\n	"net/http"\n	"net/http/httptest"\n)\n\nfunc main() {\n	h := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {\n		_ = r.Context()\n		fmt.Fprint(w, r.Method)\n	})\n	srv := httptest.NewServer(h)\n	defer srv.Close()\n	resp, _ := http.Get(srv.URL)\n	defer resp.Body.Close()\n	fmt.Println(resp.StatusCode)\n}',
					output: "200",
					tags: ["go", "http", "Context", "handler", "Request"],
				},
			],
		},
		{
			id: "cliente-http",
			name: "Cliente e erros",
			layout: "single",
			entries: [
				{
					title: "Cliente com timeout total",
					kicker: "http.Client.Timeout",
					description:
						"`Timeout` cobre handshake, redirecionamentos e leitura do corpo (até `io.EOF`). Para controlar só a fase de pedido, combine `http.NewRequestWithContext` com `context.WithTimeout`.",
					descriptionTone: "default",
					code: 'package main\n\nimport (\n	"fmt"\n	"net/http"\n	"time"\n)\n\nfunc main() {\n	c := &http.Client{Timeout: 2 * time.Second}\n	_, err := c.Get("http://example.invalid")\n	fmt.Println(err != nil)\n}',
					output: "true",
					tags: ["go", "http", "Client", "Timeout", "rede"],
				},
				{
					title: "JSON em respostas HTTP",
					kicker: "encoding/json + Header",
					description:
						"Defina `Content-Type: application/json` antes de escrever o corpo. Erros de serialização devem mapear para 500 e mensagem controlada (ver `Go: Erros` e `Go: JSON`).",
					descriptionTone: "default",
					code: 'package main\n\nimport (\n	"encoding/json"\n	"fmt"\n	"net/http"\n	"net/http/httptest"\n)\n\nfunc main() {\n	h := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {\n		w.Header().Set("Content-Type", "application/json; charset=utf-8")\n		_ = json.NewEncoder(w).Encode(map[string]bool{"ok": true})\n	})\n	srv := httptest.NewServer(h)\n	defer srv.Close()\n	resp, _ := http.Get(srv.URL)\n	defer resp.Body.Close()\n	fmt.Println(resp.Header.Get("Content-Type"))\n}',
					output: "application/json; charset=utf-8",
					tags: ["go", "http", "json", "Header", "api"],
				},
			],
		},
	],
};
