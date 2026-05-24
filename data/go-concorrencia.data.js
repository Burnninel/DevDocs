window.DOC_DATA_REGISTRY = window.DOC_DATA_REGISTRY || {};
window.DOC_DATA_REGISTRY["go-concorrencia"] = {
	id: "go-concorrencia",
	title: "Go: Concorrência",
	subtitle:
		"Guia prático para goroutines, sync.WaitGroup, Mutex, canais e select, com lembretes de cancelamento e fugas de goroutine.",
	searchPlaceholder: "Buscar goroutine, WaitGroup, Mutex, channel, select ou palavra...",
	shortcutHint: "Atalho: pressione / para focar a busca.",
	codeLanguage: "go",
	defaultSectionLayout: "single",
	quickStart: {
		title: "Duas goroutines e WaitGroup",
		kicker: "Esperar trabalho paralelo",
		description:
			"`go f()` arranca uma goroutine. `WaitGroup` conta tarefas: `Add` antes de arrancar, `Done` ao terminar, `Wait` bloqueia até zero. Combine com `Go: Context` para cancelar trabalho longo.",
		steps: [
			"Módulo com `go mod init`.",
			"Cole o exemplo em `main.go` e `go run .`.",
		],
		codeLanguage: "go",
		code: 'package main\n\nimport (\n	"fmt"\n	"sync"\n)\n\nfunc main() {\n	var wg sync.WaitGroup\n	wg.Add(1)\n	go func() {\n		defer wg.Done()\n		fmt.Println("worker")\n	}()\n	wg.Wait()\n	fmt.Println("fim")\n}',
		output: "worker\nfim",
		callout: {
			type: "warn",
			label: "Goroutine leak:",
			text: "se `Wait` nunca corre ou um canal nunca fecha, goroutines podem ficar presas. Propague `context.Context` e respeite `ctx.Done()` em loops longos.",
		},
	},
	sections: [
		{
			id: "mutex-e-race",
			name: "Mutex e memória partilhada",
			layout: "single",
			entries: [
				{
					title: "sync.Mutex para contador",
					kicker: "Exclusão mútua",
					description:
						"Protege secções críticas com `Lock`/`Unlock`; prefira `defer mu.Unlock()` logo após `Lock` para libertar mesmo com `panic`. Para leituras paralelas, avalie `sync.RWMutex`.",
					descriptionTone: "default",
					code: 'package main\n\nimport (\n	"fmt"\n	"sync"\n)\n\nfunc main() {\n	var mu sync.Mutex\n	var n int\n	var wg sync.WaitGroup\n	for i := 0; i < 100; i++ {\n		wg.Add(1)\n		go func() {\n			defer wg.Done()\n			mu.Lock()\n			n++\n			mu.Unlock()\n		}()\n	}\n	wg.Wait()\n	fmt.Println(n)\n}',
					output: "100",
					tags: ["go", "Mutex", "sync", "race", "concorrencia"],
				},
				{
					title: "go vet e data races",
					kicker: "Detetor opcional em testes",
					description:
						"Corra `go test -race ./...` em integração para apanhar acessos não sincronizados. Não substitui desenho correcto de locks ou canais.",
					descriptionTone: "default",
					code: "go test -race ./...",
					codeLanguage: "shell",
					tags: ["go", "race", "go test", "vet"],
				},
			],
		},
		{
			id: "canais-e-select",
			name: "Canais e select",
			layout: "single",
			entries: [
				{
					title: "Canal sem buffer e sincronização",
					kicker: "Envio bloqueia até receção",
					description:
						"`make(chan int)` cria canal síncrono: emissor e recetor encontram-se no mesmo instante. Útil para sinalizar conclusão ou passar posse de dados.",
					descriptionTone: "default",
					code: 'package main\n\nimport "fmt"\n\nfunc main() {\n	ch := make(chan string)\n	go func() { ch <- "ok" }()\n	fmt.Println(<-ch)\n}',
					output: "ok",
					tags: ["go", "channel", "goroutine", "sync"],
				},
				{
					title: "select com default não bloqueante",
					kicker: "Múltiplas fontes",
					description:
						"`select` escolhe um `case` pronto; se vários estiverem prontos, escolha é pseudoaleatória. `default` evita bloquear quando nenhum case está pronto.",
					descriptionTone: "default",
					code: 'package main\n\nimport "fmt"\n\nfunc main() {\n	ch := make(chan int, 1)\n	ch <- 1\n	select {\n	case v := <-ch:\n		fmt.Println(v)\n	default:\n		fmt.Println("sem dados")\n	}\n}',
					output: "1",
					tags: ["go", "select", "channel", "default"],
				},
			],
		},
	],
};
