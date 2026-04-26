window.DOC_DATA_REGISTRY = window.DOC_DATA_REGISTRY || {};
window.DOC_DATA_REGISTRY["php-headers-http"] = {
	id: "php-headers-http",
	title: "PHP: Headers HTTP com header()",
	subtitle:
		"Guia prático para enviar headers corretos em APIs PHP, com foco em CORS, cache e respostas JSON consistentes.",
	searchPlaceholder: "Buscar header, cors, cache, json ou palavra...",
	shortcutHint: "Atalho: pressione / para focar a busca.",
	codeLanguage: "php",
	defaultSectionLayout: "single",
	quickStart: {
		title: "Como testar os exemplos desta documentação",
		kicker: "Execução local com servidor embutido e curl",
		description:
			"Como headers HTTP fazem sentido em resposta web, o ideal é testar com `php -S` e inspecionar com `curl -i`.",
		steps: [
			"Verifique se o PHP está disponível com `php --version`.",
			"Crie um arquivo, por exemplo `api.php`, e cole um exemplo desta página.",
			"Suba servidor local com `php -S localhost:8000 api.php`.",
			"Em outro terminal, veja headers e body com `curl -i http://localhost:8000`.",
		],
		codeLanguage: "shell",
		code: "php --version\nphp -S localhost:8000 api.php\ncurl -i http://localhost:8000",
		callout: {
			type: "hint",
			label: "Dica:",
			text: "se você testar só via CLI (`php arquivo.php`), não verá o comportamento HTTP completo dos headers.",
		},
	},
	sections: [
		{
			id: "o-que-sao-headers-http",
			name: "O que são Headers HTTP",
			layout: "single",
			entries: [
				{
					title: "Headers são metadados da comunicação HTTP",
					kicker: "Eles controlam como cliente e servidor se entendem",
					description:
						"Headers HTTP carregam instruções sobre tipo de conteúdo, cache, autenticação, CORS e status de resposta. Use quando você precisa controlar como navegador, frontend ou outra API deve interpretar a resposta. Eles existem para tornar a integração previsível e segura.",
					descriptionTone: "default",
					code: '<?php\n// Exemplo de resposta HTTP vista pelo cliente\nHTTP/1.1 200 OK\nContent-Type: application/json; charset=utf-8\nCache-Control: no-store\nX-Request-Id: req-123\n\n{"ok":true,"mensagem":"Resposta entregue"}',
					codeLanguage: "http",
					tags: [
						"php",
						"http",
						"headers",
						"conceito",
						"api",
						"resposta",
					],
					callout: {
						type: "hint",
						label: "Leitura rápida:",
						text: "o body carrega os dados; os headers dizem como esses dados devem ser tratados.",
					},
				},
			],
		},
		{
			id: "funcao-header-php",
			name: "Função header() no PHP",
			layout: "single",
			entries: [
				{
					title: "Como funciona header() na prática",
					kicker: "Enviar instruções de resposta antes do body",
					description:
						"`header()` adiciona ou altera headers da resposta HTTP. Use no início da execução da rota para definir tipo de conteúdo, status, cache e CORS. O porquê é simples: esses metadados precisam chegar junto com a resposta para o cliente decidir o comportamento correto.",
					descriptionTone: "default",
					code: '<?php\nheader("Content-Type: application/json; charset=utf-8"); // Define formato de resposta\nheader("X-Request-Id: req-789"); // Inclui rastreio para observabilidade\nhttp_response_code(200); // Define status HTTP de forma explícita\n\necho json_encode([\n    "ok" => true,\n    "mensagem" => "Header enviado com sucesso",\n]);',
					output: "{\"ok\":true,\"mensagem\":\"Header enviado com sucesso\"}",
					tags: [
						"php",
						"header",
						"http_response_code",
						"json",
						"api",
						"metadados",
					],
				},
				{
					title: "Regra obrigatória: headers antes de qualquer saída",
					kicker: "Se já houve echo/HTML, header pode falhar",
					description:
						"Headers devem ser enviados antes de qualquer saída (`echo`, espaço fora de `<?php ?>`, HTML ou warning). Use essa regra sempre para evitar erro `Cannot modify header information`. Isso é crítico porque header enviado fora de ordem quebra CORS, status e cache.",
					descriptionTone: "warn",
					code: '<?php\necho "Começou"; // Saída enviada cedo demais\nheader("Content-Type: application/json"); // Erro: header já não pode ser alterado\n\necho json_encode(["ok" => true]);',
					tags: [
						"php",
						"header",
						"headers-already-sent",
						"erro",
						"saida",
						"ordem",
					],
					callout: {
						type: "danger",
						label: "Perigo:",
						text: "esse erro costuma aparecer por espaços/linhas antes de `<?php` ou por `echo` de debug esquecido.",
					},
				},
			],
		},
		{
			id: "tipos-comuns-headers",
			name: "Tipos comuns de headers",
			layout: "single",
			entries: [
				{
					title: "Headers mais usados em APIs e integrações",
					kicker: "Cada header resolve um problema de protocolo",
					description:
						"Use `Content-Type` para formato de resposta, `Authorization` no request para autenticação, `Accept` para negociar formato, `Location` para redirecionamento e `Cache-Control` para política de cache. Saber quando usar cada um evita integração quebrada ou comportamento inesperado.",
					descriptionTone: "default",
					code: '<?php\nheader("Content-Type: application/json; charset=utf-8"); // Informa tipo e charset do body\nheader("Cache-Control: no-store, no-cache, must-revalidate"); // Evita cache em dados sensíveis\nheader("X-Request-Id: req-456"); // Facilita rastreio em logs\n\nhttp_response_code(201); // Exemplo de criação de recurso\nheader("Location: /api/pedidos/123"); // Aponta URL do recurso criado\n\necho json_encode(["id" => 123, "status" => "criado"]);',
					output: "{\"id\":123,\"status\":\"criado\"}",
					tags: [
						"php",
						"headers",
						"content-type",
						"cache-control",
						"location",
						"api",
					],
				},
			],
		},
		{
			id: "headers-cors",
			name: "Headers para controle de CORS",
			layout: "single",
			entries: [
				{
					title: "CORS prático para frontend em outro domínio",
					kicker: "Liberar só origens confiáveis e métodos necessários",
					description:
						"CORS define se um frontend de outra origem pode chamar sua API no navegador. Use quando frontend e backend estão em domínios/portas diferentes. O motivo é segurança: navegador bloqueia por padrão, então você precisa liberar de forma explícita e controlada.",
					descriptionTone: "default",
					code: '<?php\n$originPermitida = "https://app.exemplo.com";\n$originRecebida = $_SERVER["HTTP_ORIGIN"] ?? "";\n\nif ($originRecebida === $originPermitida) {\n    header("Access-Control-Allow-Origin: " . $originRecebida); // Libera só origem conhecida\n    header("Vary: Origin"); // Evita cache incorreto para origens diferentes\n    header("Access-Control-Allow-Credentials: true"); // Permite cookies/token com credenciais\n}\n\nheader("Content-Type: application/json; charset=utf-8");\necho json_encode(["ok" => true, "mensagem" => "CORS aplicado"]);',
					output: "{\"ok\":true,\"mensagem\":\"CORS aplicado\"}",
					tags: [
						"php",
						"cors",
						"access-control-allow-origin",
						"vary-origin",
						"credentials",
						"api",
					],
					callout: {
						type: "warn",
						label: "Atenção:",
						text: "não combine `Access-Control-Allow-Origin: *` com `Access-Control-Allow-Credentials: true`; navegadores bloqueiam essa combinação.",
					},
				},
				{
					title: "Preflight OPTIONS com métodos e headers permitidos",
					kicker: "Sem resposta correta de preflight, a chamada real nem acontece",
					description:
						"Quando a requisição é não simples (ex.: `Authorization`, `PUT`, `DELETE`), o navegador envia `OPTIONS` antes. Use `Access-Control-Allow-Methods` e `Access-Control-Allow-Headers` para declarar o que sua API aceita. Isso evita bloqueio no browser antes mesmo do endpoint rodar.",
					descriptionTone: "default",
					code: '<?php\nheader("Access-Control-Allow-Origin: https://app.exemplo.com");\nheader("Vary: Origin");\nheader("Access-Control-Allow-Credentials: true");\nheader("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS"); // Métodos aceitos\nheader("Access-Control-Allow-Headers: Content-Type, Authorization, X-Request-Id"); // Headers de request aceitos\n\nif (($_SERVER["REQUEST_METHOD"] ?? "GET") === "OPTIONS") {\n    http_response_code(204); // Responde preflight sem body\n    exit;\n}\n\nheader("Content-Type: application/json; charset=utf-8");\necho json_encode(["ok" => true]);',
					output: "{\"ok\":true}",
					tags: [
						"php",
						"cors",
						"options",
						"access-control-allow-methods",
						"access-control-allow-headers",
						"preflight",
					],
				},
			],
		},
		{
			id: "headers-cache",
			name: "Headers de controle de cache",
			layout: "single",
			entries: [
				{
					title: "Definir política de cache por tipo de dado",
					kicker: "Performance quando pode cachear, segurança quando não pode",
					description:
						"Use `Cache-Control` para controlar se a resposta pode ser armazenada e por quanto tempo. Em dados sensíveis (token, perfil, sessão), prefira `no-store`. Em recursos estáveis (catálogo público), use `public, max-age=...` para reduzir latência e carga no backend.",
					descriptionTone: "default",
					code: '<?php\n$rota = $_GET["rota"] ?? "perfil";\n\nif ($rota === "perfil") {\n    header("Cache-Control: no-store, no-cache, must-revalidate"); // Protege dado sensível\n} else {\n    header("Cache-Control: public, max-age=300"); // Permite cache por 5 minutos\n}\n\nheader("Content-Type: application/json; charset=utf-8");\necho json_encode(["rota" => $rota, "ok" => true]);',
					output: "{\"rota\":\"perfil\",\"ok\":true}",
					tags: [
						"php",
						"cache-control",
						"cache",
						"api",
						"performance",
						"seguranca",
					],
				},
			],
		},
		{
			id: "headers-resposta-api",
			name: "Headers de resposta em APIs (JSON, status, etc.)",
			layout: "single",
			entries: [
				{
					title: "Resposta API consistente: status + Content-Type + body JSON",
					kicker: "Contrato claro para frontend e integrações externas",
					description:
						"Em API, use status code correto, `Content-Type` explícito e estrutura JSON previsível. Faça isso sempre para facilitar tratamento de erro no frontend e em integrações. Sem esse padrão, cliente precisa adivinhar resultado e surgem bugs de parsing e fallback.",
					descriptionTone: "default",
					contentBlocks: [
						{
							type: "flow-steps",
							title: "Ordem recomendada",
							steps: [
								"Defina `Content-Type` e política de cache antes do body.",
								"Valide entrada e decida o status HTTP.",
								"Monte um JSON previsível para sucesso ou erro.",
								"Finalize cedo com `exit` quando a rota já tiver respondido.",
							],
						},
					],
					code: '<?php\n$usuarioId = (int) ($_GET["id"] ?? 0);\n\nheader("Content-Type: application/json; charset=utf-8");\nheader("Cache-Control: no-store");\n\nif ($usuarioId <= 0) {\n    http_response_code(422); // Erro de validação\n    echo json_encode([\n        "ok" => false,\n        "erro" => "id inválido",\n    ]);\n    exit;\n}\n\nhttp_response_code(200); // Sucesso\n\necho json_encode([\n    "ok" => true,\n    "data" => ["id" => $usuarioId, "nome" => "Ana"],\n]);',
					output: "{\"ok\":false,\"erro\":\"id inválido\"}",
					tags: [
						"php",
						"api",
						"json",
						"status-code",
						"content-type",
						"resposta",
					],
					callout: {
						type: "hint",
						label: "Padrão útil:",
						text: "mantenha o mesmo formato para sucesso/erro (`ok`, `data`, `erro`) para reduzir ifs no consumidor da API.",
					},
				},
			],
		},
		{
			id: "exemplo-pratico-completo",
			name: "Exemplo prático completo (API simulada)",
			layout: "single",
			entries: [
				{
					title: "API simulada com CORS, preflight, cache e JSON",
					kicker: "Fluxo completo pronto para adaptar no projeto",
					description:
						"Este exemplo junta os pontos essenciais: CORS com origem controlada, preflight `OPTIONS`, cache adequado, status corretos e resposta JSON. Use como base para endpoints reais, porque ele já cobre o que normalmente quebra em integração frontend + API.",
					descriptionTone: "default",
					code: '<?php\n$originPermitida = "https://app.exemplo.com";\n$originRecebida = $_SERVER["HTTP_ORIGIN"] ?? "";\n\nif ($originRecebida === $originPermitida) {\n    header("Access-Control-Allow-Origin: " . $originRecebida); // Libera só origem confiável\n    header("Vary: Origin"); // Garante cache correto por origem\n    header("Access-Control-Allow-Credentials: true"); // Permite credenciais quando necessário\n}\n\nheader("Access-Control-Allow-Methods: GET, POST, OPTIONS"); // Métodos liberados para browser\nheader("Access-Control-Allow-Headers: Content-Type, Authorization, X-Request-Id"); // Headers de request aceitos\n\nif (($_SERVER["REQUEST_METHOD"] ?? "GET") === "OPTIONS") {\n    http_response_code(204); // Responde preflight sem body\n    exit;\n}\n\nheader("Content-Type: application/json; charset=utf-8");\nheader("Cache-Control: no-store"); // Evita cache de resposta dinâmica\n\n$rota = parse_url($_SERVER["REQUEST_URI"] ?? "/", PHP_URL_PATH);\n\nif ($rota === "/api/health") {\n    http_response_code(200);\n    echo json_encode(["ok" => true, "service" => "up"]); // Endpoint simples de health check\n    exit;\n}\n\nif ($rota === "/api/usuarios" && ($_SERVER["REQUEST_METHOD"] ?? "GET") === "GET") {\n    http_response_code(200);\n    echo json_encode([\n        "ok" => true,\n        "data" => [\n            ["id" => 1, "nome" => "Ana"],\n            ["id" => 2, "nome" => "Bruno"],\n        ],\n    ]);\n    exit;\n}\n\nhttp_response_code(404);\necho json_encode(["ok" => false, "erro" => "Rota não encontrada"]);',
					output: "{\"ok\":true,\"service\":\"up\"}",
					tags: [
						"php",
						"api",
						"cors",
						"cache-control",
						"json",
						"exemplo-pratico",
					],
				},
			],
		},
		{
			id: "boas-praticas",
			name: "Boas práticas",
			layout: "single",
			entries: [
				{
					title: "Centralizar e padronizar envio de headers",
					kicker: "Evitar inconsistência entre endpoints",
					description:
						"Centralize headers comuns em funções para não repetir regra em cada rota. Use quando sua API tem vários endpoints e times diferentes mexendo no código. O ganho é consistência: menos erro de CORS/cache e manutenção mais rápida.",
					descriptionTone: "default",
					code: '<?php\nfunction responderJson(int $status, array $payload): void\n{\n    header("Content-Type: application/json; charset=utf-8"); // Padrão de conteúdo\n    header("Cache-Control: no-store"); // Padrão para resposta dinâmica\n    http_response_code($status); // Padrão de status\n\n    echo json_encode($payload);\n}\n\nresponderJson(200, ["ok" => true, "mensagem" => "Resposta padronizada"]);',
					output: "{\"ok\":true,\"mensagem\":\"Resposta padronizada\"}",
					tags: [
						"php",
						"boas-praticas",
						"header",
						"padrao",
						"api",
						"manutencao",
					],
					callout: {
						type: "hint",
						label: "Checklist rápido:",
						text: "headers antes da saída, CORS explícito por origem, `Cache-Control` adequado ao dado e status HTTP coerente com o resultado.",
					},
				},
			],
		},
		{
			id: "erros-comuns",
			name: "Erros comuns",
			layout: "single",
			entries: [
				{
					title: "Falhas frequentes com header() em APIs PHP",
					kicker: "Erros pequenos que causam grandes sintomas no frontend",
					description:
						"Erros comuns incluem enviar output antes de `header()`, liberar CORS de forma insegura, esquecer `Vary: Origin` e usar cache agressivo em dados sensíveis. Conhecer esses pontos evita bug intermitente, falha de autenticação e resposta incorreta em produção.",
					descriptionTone: "warn",
					code: '<?php\n// 1) Saída antes de header()\necho "debug"; // Erro: já iniciou o body\nheader("Content-Type: application/json"); // Pode gerar \"Cannot modify header information\"\n\n// 2) CORS inseguro com credenciais\nheader("Access-Control-Allow-Origin: *");\nheader("Access-Control-Allow-Credentials: true"); // Combinação inválida para navegador\n\n// 3) Cache inadequado para dado sensível\nheader("Cache-Control: public, max-age=3600"); // Evite em dados de sessão/perfil',
					tags: [
						"php",
						"erros-comuns",
						"header",
						"cors",
						"cache-control",
						"api",
					],
					callout: {
						type: "danger",
						label: "Perigo:",
						text: "problemas de header nem sempre aparecem no backend; muitas vezes o sintoma surge só no navegador ou no consumidor da API.",
					},
				},
			],
		},
	],
};
