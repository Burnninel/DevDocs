window.DOC_DATA_REGISTRY = window.DOC_DATA_REGISTRY || {};
window.DOC_DATA_REGISTRY["php-superglobais"] = {
	id: "php-superglobais",
	title: "PHP: Superglobais",
	subtitle:
		"Guia prático para usar superglobais com segurança em requisições, sessão, cookies e upload de arquivos.",
	searchPlaceholder:
		"Buscar $_SERVER, $_GET, $_POST, $_SESSION, $_FILES ou palavra...",
	shortcutHint: "Atalho: pressione / para focar a busca.",
	codeLanguage: "php",
	defaultSectionLayout: "single",
	quickStart: {
		title: "Como testar os exemplos desta documentação",
		kicker: "HTTP local para visualizar query string, formulário, sessão e upload",
		description:
			"Superglobais como `$_GET`, `$_POST`, `$_FILES` e `$_SERVER` fazem mais sentido em requisições HTTP reais.",
		steps: [
			"Verifique o PHP com `php --version`.",
			"Crie os arquivos de teste em uma pasta local.",
			"Inicie o servidor com `php -S localhost:8000`.",
			"Abra `http://localhost:8000/request-info.php?error=senha_incorreta`.",
		],
		codeLanguage: "shell",
		code: "php --version\nphp -S localhost:8000",
		callout: {
			type: "hint",
			label: "Documentação relacionada:",
			text: "`PHP: Sessões, Cookies e Tokens` detalha autenticação, regeneração de ID, CSRF e `setcookie` seguro; aqui o foco é o que chega em `$_GET`, `$_POST`, `$_SESSION`, etc.",
		},
	},
	sections: [
		{
			id: "o-que-sao-superglobais",
			name: "1. O que são superglobais",
			layout: "single",
			entries: [
				{
					title: "Superglobais são arrays associativos disponíveis em qualquer escopo",
					kicker: "Entrada de dados do servidor, URL, formulário, sessão, cookie e upload",
					description:
						"Superglobais do PHP já existem no script inteiro e armazenam dados de contexto da requisição. Algumas chaves são preenchidas pelo servidor, outras surgem dinamicamente por URL, formulário, cookie, sessão ou upload.",
					contentBlocks: [
						{
							type: "tech-list",
							title: "Superglobais mais usadas no dia a dia",
							termHeader: "Superglobal",
							descriptionHeader: "Origem típica dos dados",
							items: [
								{
									term: "$_SERVER",
									description: "Metadados da requisição e do ambiente web (método, URI, host, user-agent).",
								},
								{
									term: "$_GET",
									description: "Parâmetros da query string na URL.",
								},
								{
									term: "$_POST",
									description: "Dados enviados no corpo de requisição HTTP POST.",
								},
								{
									term: "$_SESSION",
									description: "Dados de estado guardados no servidor por sessão.",
								},
								{
									term: "$_COOKIE",
									description: "Dados persistidos no navegador e enviados em cada requisição ao domínio.",
								},
								{
									term: "$_FILES",
									description: "Metadados de upload de arquivos enviados via formulário.",
								},
								{
									term: "$_REQUEST",
									description: "Mescla dados de GET/POST/COOKIE conforme configuração do PHP.",
								},
								{
									term: "$_ENV",
									description: "Variáveis de ambiente do sistema/processo PHP.",
								},
								{
									term: "$GLOBALS",
									description: "Mapa de variáveis globais definidas no script.",
								},
							],
						},
						{
							type: "reference-card",
							title: "Regra de ouro",
							description:
								"Nem toda chave existe sempre. Antes de usar uma chave de superglobal, valide com `isset()` ou aplique fallback com `??`.",
						},
					],
					code: '<?php\nfunction renderMensagem(): void\n{\n    $erro = $_GET["error"] ?? "sem erro na URL";\n    $metodo = $_SERVER["REQUEST_METHOD"] ?? "CLI";\n\n    echo "Método: {$metodo}" . PHP_EOL;\n    echo "Erro: {$erro}" . PHP_EOL;\n}\n\nrenderMensagem();',
					output: "Método: GET\nErro: senha_incorreta",
					tags: ["php", "superglobais", "arrays-associativos", "isset", "null-coalescing", "base"],
				},
			],
		},
		{
			id: "por-que-superglobais",
			name: "2. Por que são chamadas de superglobais",
			layout: "single",
			entries: [
				{
					title: "Elas podem ser acessadas sem import, sem parâmetro e em qualquer função",
					kicker: "Escopo global estendido para leitura prática de contexto",
					description:
						"São chamadas de superglobais porque o PHP as disponibiliza automaticamente em qualquer escopo. Você não precisa usar `global` para ler `$_GET`, `$_POST`, `$_SERVER`, `$_SESSION` e similares.",
					contentBlocks: [
						{
							type: "context-block",
							variant: "attention",
							label: "Atenção:",
							text: "acessível em qualquer escopo não significa seguro por padrão; dados de entrada ainda precisam de validação.",
						},
					],
					code: '<?php\nfunction resolverPaginaAtual(): string\n{\n    // Superglobal acessível dentro de função sem precisar passar parâmetro\n    return $_GET["page"] ?? "home";\n}\n\necho "Página: " . resolverPaginaAtual() . PHP_EOL;',
					output: "Página: home",
					tags: ["php", "superglobal", "escopo", "funcao", "get", "conceito"],
				},
			],
		},
		{
			id: "server",
			name: "3. $_SERVER",
			layout: "single",
			entries: [
				{
					title: "Leia metadados da requisição e do servidor com fallback seguro",
					kicker: "Nem toda chave existe em todo servidor ou contexto",
					description:
						"`$_SERVER` contém informações do request e do ambiente. Algumas chaves variam por servidor e podem não existir. Use `??` para evitar warning e trate HTTPS de forma defensiva.",
					contentBlocks: [
						{
							type: "tech-list",
							title: "Chaves úteis de $_SERVER",
							termHeader: "Chave",
							descriptionHeader: "Uso prático",
							items: [
								{
									term: "$_SERVER['REQUEST_METHOD']",
									description: "Método HTTP da requisição, como GET ou POST.",
								},
								{
									term: "$_SERVER['HTTP_HOST']",
									description: "Host recebido no request, por exemplo `localhost:8000`.",
								},
								{
									term: "$_SERVER['REQUEST_URI']",
									description: "URI com caminho e query string atual.",
								},
								{
									term: "$_SERVER['SCRIPT_NAME']",
									description: "Caminho do script executado no servidor.",
								},
								{
									term: "$_SERVER['PHP_SELF']",
									description: "Nome do script atual; em HTML deve ser escapado para evitar XSS.",
								},
								{
									term: "$_SERVER['HTTPS']",
									description: "Indica HTTPS em alguns servidores; pode não existir.",
								},
								{
									term: "$_SERVER['REMOTE_ADDR']",
									description: "IP do cliente da conexão atual.",
								},
								{
									term: "$_SERVER['HTTP_USER_AGENT']",
									description: "User-Agent enviado pelo navegador ou cliente HTTP.",
								},
							],
						},
						{
							type: "context-block",
							variant: "tip",
							label: "Dica:",
							text: "para verificar HTTPS, combine `$_SERVER['HTTPS']` com `$_SERVER['SERVER_PORT']` usando fallback com `??`.",
						},
					],
					code: '<?php\n$metodo = $_SERVER["REQUEST_METHOD"] ?? "CLI";\n$host = $_SERVER["HTTP_HOST"] ?? "localhost";\n$uri = $_SERVER["REQUEST_URI"] ?? "/";\n$scriptName = $_SERVER["SCRIPT_NAME"] ?? "desconhecido";\n$phpSelf = $_SERVER["PHP_SELF"] ?? "desconhecido";\n$ip = $_SERVER["REMOTE_ADDR"] ?? "IP indisponível";\n$userAgent = $_SERVER["HTTP_USER_AGENT"] ?? "User-Agent indisponível";\n\n$isHttps = (!empty($_SERVER["HTTPS"]) && $_SERVER["HTTPS"] !== "off")\n    || (($_SERVER["SERVER_PORT"] ?? "") === "443");\n\necho "Método: {$metodo}" . PHP_EOL;\necho "Host: {$host}" . PHP_EOL;\necho "URI: {$uri}" . PHP_EOL;\necho "Script: {$scriptName}" . PHP_EOL;\necho "PHP_SELF: {$phpSelf}" . PHP_EOL;\necho "HTTPS ativo: " . ($isHttps ? "sim" : "não") . PHP_EOL;\necho "IP: {$ip}" . PHP_EOL;\necho "User-Agent: {$userAgent}" . PHP_EOL;',
					output:
						"Método: GET\nHost: localhost:8000\nURI: /request-info.php?error=senha_incorreta\nScript: /request-info.php\nPHP_SELF: /request-info.php\nHTTPS ativo: não\nIP: 127.0.0.1\nUser-Agent: Mozilla/5.0",
					tags: ["php", "server", "request_method", "https", "php_self", "seguranca"],
				},
			],
		},
		{
			id: "get",
			name: "4. $_GET",
			layout: "single",
			entries: [
				{
					title: "Use $_GET para dados da query string da URL",
					kicker: "Leitura de filtros, paginação, status e parâmetros públicos",
					description:
						"`$_GET` recebe chaves criadas dinamicamente pelos parâmetros da URL. Exemplo: `/login.php?error=senha_incorreta` cria a chave `$_GET['error']`.",
					contentBlocks: [
						{
							type: "context-block",
							variant: "attention",
							label: "Atenção:",
							text: "dados de URL podem ser alterados por qualquer pessoa. Nunca trate `$_GET` como confiável sem validação.",
						},
					],
					code: '<?php\n// URL: /login.php?error=senha_incorreta&redirect=dashboard\n$erro = $_GET["error"] ?? "";\n$redirect = $_GET["redirect"] ?? "home";\n\nif ($erro !== "") {\n    echo "Erro de login: " . htmlspecialchars($erro, ENT_QUOTES) . PHP_EOL;\n}\n\necho "Redirecionar para: {$redirect}" . PHP_EOL;',
					output: "Erro de login: senha_incorreta\nRedirecionar para: dashboard",
					tags: ["php", "get", "query-string", "url", "htmlspecialchars", "dinamico"],
				},
			],
		},
		{
			id: "post",
			name: "5. $_POST",
			layout: "single",
			entries: [
				{
					title: "Use $_POST para dados enviados no corpo da requisição",
					kicker: "Ideal para formulário de login, cadastro e ações sensíveis",
					description:
						"`$_POST` representa dados enviados via método POST. Ainda assim, esses dados não são automaticamente seguros e precisam de validação.",
					contentBlocks: [
						{
							type: "comparison-block",
							title: "GET x POST em leitura rápida",
							columns: [
								{
									title: "GET",
									items: [
										"Dados vão na URL (query string).",
										"Útil para filtros, busca e paginação.",
										"Mais simples para compartilhar links.",
									],
								},
								{
									title: "POST",
									items: [
										"Dados vão no corpo da requisição.",
										"Útil para envio de formulário e operações de escrita.",
										"Reduz exposição de dados na URL.",
									],
								},
							],
						},
					],
					code: '<?php\nif (($_SERVER["REQUEST_METHOD"] ?? "GET") === "POST") {\n    $email = trim($_POST["email"] ?? "");\n    $senha = $_POST["senha"] ?? "";\n\n    if ($email === "" || $senha === "") {\n        exit("Preencha email e senha.");\n    }\n\n    echo "POST recebido para: {$email}" . PHP_EOL;\n}',
					output: "POST recebido para: ana@empresa.com",
					tags: ["php", "post", "formulario", "request_method", "validacao", "seguranca"],
				},
			],
		},
		{
			id: "session",
			name: "6. $_SESSION",
			layout: "single",
			entries: [
				{
					title: "Guarde estado do usuário no servidor com $_SESSION",
					kicker: "Sessão exige `session_start()` antes de uso",
					description:
						"`$_SESSION` armazena dados no servidor durante a sessão do usuário. Isso é ideal para estado de autenticação, pois o navegador recebe só o identificador da sessão. Para endurecimento (cookie de sessão, `session_regenerate_id`, tokens anti-CSRF), siga o guia `PHP: Sessões, Cookies e Tokens` no hub.",
					contentBlocks: [
						{
							type: "comparison-block",
							title: "SESSION x COOKIE",
							columns: [
								{
									title: "SESSION",
									items: [
										"Dados ficam no servidor.",
										"Boa para estado de login e autorização.",
										"Exige `session_start()`.",
									],
								},
								{
									title: "COOKIE",
									items: [
										"Dados ficam no navegador.",
										"Bom para preferências não sensíveis.",
										"Pode ser lido e alterado no cliente.",
									],
								},
							],
						},
					],
					code: '<?php\nsession_start();\n\n$_SESSION["auth"] = [\n    "id" => 42,\n    "nome" => "Ana",\n    "perfil" => "admin",\n];\n\necho "Usuário logado: " . ($_SESSION["auth"]["nome"] ?? "visitante") . PHP_EOL;',
					output: "Usuário logado: Ana",
					tags: [
						"php",
						"session",
						"session_start",
						"auth",
						"login",
						"servidor",
						"sessoes",
						"csrf",
					],
					callout: {
						type: "hint",
						label: "Fronteira:",
						text: "esta página explica o **acesso** a `$_SESSION`; políticas de login e segurança ficam na doc de Sessões.",
					},
				},
			],
		},
		{
			id: "cookie",
			name: "7. $_COOKIE",
			layout: "single",
			entries: [
				{
					title: "Cookie persiste no navegador e volta em novas requisições",
					kicker: "Use para preferências leves e nunca para segredo sensível",
					description:
						"`$_COOKIE` contém valores enviados pelo navegador. Com `setcookie()` você define expiração e flags de segurança como `HttpOnly`, `Secure` e `SameSite`.",
					contentBlocks: [
						{
							type: "context-block",
							variant: "common-error",
							label: "Perigo:",
							text: "não salve senha, token mestre, chave privada ou payload sensível em cookies comuns.",
						},
					],
					code: '<?php\nsetcookie("tema", "dark", [\n    "expires" => time() + 60 * 60 * 24 * 30,\n    "path" => "/",\n    "secure" => true,\n    "httponly" => true,\n    "samesite" => "Lax",\n]);\n\n$tema = $_COOKIE["tema"] ?? "light";\necho "Tema atual: {$tema}" . PHP_EOL;',
					output: "Tema atual: dark",
					tags: ["php", "cookie", "setcookie", "httponly", "samesite", "secure"],
				},
			],
		},
		{
			id: "files",
			name: "8. $_FILES",
			layout: "single",
			entries: [
				{
					title: "Upload com $_FILES exige validação de tamanho, erro e tipo real",
					kicker: "Não confie cegamente em `type` vindo do cliente",
					description:
						"`$_FILES` traz metadados do upload como `name`, `type`, `tmp_name`, `error` e `size`. Em produção, valide extensão e MIME real antes de mover arquivo.",
					contentBlocks: [
						{
							type: "tech-list",
							title: "Chaves comuns em $_FILES['arquivo']",
							termHeader: "Chave",
							descriptionHeader: "Significado",
							items: [
								{
									term: "name",
									description: "Nome original do arquivo enviado pelo cliente.",
								},
								{
									term: "type",
									description: "Tipo informado pelo cliente; não deve ser confiança única.",
								},
								{
									term: "tmp_name",
									description: "Caminho temporário no servidor para o arquivo recebido.",
								},
								{
									term: "error",
									description: "Código de erro do upload (`UPLOAD_ERR_*`).",
								},
								{
									term: "size",
									description: "Tamanho em bytes do arquivo enviado.",
								},
							],
						},
					],
					code: '<?php\nif (($_SERVER["REQUEST_METHOD"] ?? "GET") === "POST" && isset($_FILES["avatar"])) {\n    $arquivo = $_FILES["avatar"];\n\n    if (($arquivo["error"] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {\n        exit("Falha no upload.");\n    }\n\n    if (($arquivo["size"] ?? 0) > 2 * 1024 * 1024) {\n        exit("Arquivo maior que 2MB.");\n    }\n\n    $mime = mime_content_type($arquivo["tmp_name"] ?? "");\n    $permitidos = ["image/jpeg", "image/png"];\n\n    if (!in_array($mime, $permitidos, true)) {\n        exit("Tipo de arquivo inválido.");\n    }\n\n    echo "Upload validado com sucesso." . PHP_EOL;\n}',
					output: "Upload validado com sucesso.",
					tags: ["php", "files", "upload", "validacao", "mime", "seguranca"],
					callout: {
						type: "hint",
						label: "Depois da validação:",
						text: "para gravar no disco, caminhos seguros, append e logs, use `PHP: Ficheiros e I/O` no hub (`move_uploaded_file`, `file_put_contents`, etc.).",
					},
				},
			],
		},
		{
			id: "request",
			name: "9. $_REQUEST",
			layout: "single",
			entries: [
				{
					title: "Evite $_REQUEST quando clareza de origem importa",
					kicker: "Pode misturar GET, POST e COOKIE dependendo da configuração",
					description:
						"`$_REQUEST` pode gerar ambiguidade porque não deixa claro se o dado veio da URL, formulário ou cookie. Em código organizado e seguro, prefira `$_GET`, `$_POST` e `$_COOKIE` explicitamente.",
					contentBlocks: [
						{
							type: "context-block",
							variant: "attention",
							label: "Atenção:",
							text: "quando você usa `$_REQUEST`, perde rastreabilidade da origem e pode introduzir comportamento inesperado.",
						},
					],
					code: '<?php\n// Evite em fluxos críticos\n$filtro = $_REQUEST["filtro"] ?? "";\n\necho "Filtro recebido: {$filtro}" . PHP_EOL;\n\n// Preferível em código claro:\n//$filtro = $_GET["filtro"] ?? "";\n//$acao = $_POST["acao"] ?? "";',
					output: "Filtro recebido: recentes",
					tags: ["php", "request", "get", "post", "cookie", "clareza"],
				},
			],
		},
		{
			id: "env",
			name: "10. $_ENV",
			layout: "single",
			entries: [
				{
					title: "Use variáveis de ambiente para configuração sensível",
					kicker: "Banco, token, modo de execução e segredos fora do código",
					description:
						"`$_ENV` e `getenv()` ajudam a separar segredo de configuração da base de código. Isso reduz vazamento em repositório e facilita troca por ambiente.",
					contentBlocks: [
						{
							type: "reference-card",
							title: "Exemplos comuns em produção",
							items: [
								"`DB_HOST`, `DB_PORT`, `DB_NAME`",
								"`DB_USER`, `DB_PASSWORD`",
								"`APP_ENV` (dev, stage, prod)",
								"`JWT_SECRET` ou chave de API",
							],
						},
					],
					code: '<?php\n$appEnv = $_ENV["APP_ENV"] ?? getenv("APP_ENV") ?: "dev";\n$dbHost = $_ENV["DB_HOST"] ?? getenv("DB_HOST") ?: "127.0.0.1";\n$dbUser = $_ENV["DB_USER"] ?? getenv("DB_USER") ?: "root";\n\necho "Ambiente: {$appEnv}" . PHP_EOL;\necho "Host do banco: {$dbHost}" . PHP_EOL;\necho "Usuário do banco: {$dbUser}" . PHP_EOL;',
					output: "Ambiente: dev\nHost do banco: 127.0.0.1\nUsuário do banco: root",
					tags: ["php", "env", "configuracao", "segredo", "getenv", "ambiente"],
				},
			],
		},
		{
			id: "globals",
			name: "11. $GLOBALS",
			layout: "single",
			entries: [
				{
					title: "Acesse variáveis globais via $GLOBALS com cuidado",
					kicker: "Funciona, mas pode aumentar acoplamento e dificultar manutenção",
					description:
						"`$GLOBALS` guarda variáveis globais do script em um array associativo. É útil em casos específicos, mas excesso costuma reduzir clareza e testabilidade.",
					contentBlocks: [
						{
							type: "context-block",
							variant: "common-error",
							label: "Atenção:",
							text: "prefira injeção de dependência e passagem de parâmetros quando possível.",
						},
					],
					code: '<?php\n$versaoAplicacao = "1.4.0";\n\nfunction exibirVersao(): void\n{\n    echo "Versão: " . ($GLOBALS["versaoAplicacao"] ?? "desconhecida") . PHP_EOL;\n}\n\nexibirVersao();',
					output: "Versão: 1.4.0",
					tags: ["php", "globals", "escopo", "acoplamento", "boas-praticas", "manutencao"],
				},
			],
		},
		{
			id: "nativa-vs-chave-dinamica",
			name: "12. Diferença entre variável nativa e chave dinâmica",
			layout: "single",
			entries: [
				{
					title: "Superglobal é nativa; chaves internas dependem do contexto",
					kicker: "Separar esses conceitos evita confusão e warning de chave inexistente",
					description:
						"`$_GET`, `$_SERVER` e `$_SESSION` existem por padrão no PHP. Já chaves como `$_GET['error']`, `$_SERVER['HTTP_HOST']` e `$_SESSION['user_id']` podem existir ou não, conforme origem dos dados.",
					contentBlocks: [
						{
							type: "comparison-block",
							title: "Nativa x dinâmica",
							columns: [
								{
									title: "Variável nativa",
									items: [
										"`$_GET` é superglobal nativa do PHP.",
										"`$_SERVER` é superglobal nativa do PHP.",
										"`$_SESSION` é superglobal nativa do PHP.",
									],
								},
								{
									title: "Chave dinâmica",
									items: [
										"`$_GET['error']` depende da URL.",
										"`$_SERVER['HTTP_HOST']` depende do servidor/request.",
										"`$_SESSION['user_id']` depende da lógica da aplicação.",
									],
								},
							],
						},
					],
					code: '<?php\nsession_start();\n\n$erro = $_GET["error"] ?? "sem erro";\n$host = $_SERVER["HTTP_HOST"] ?? "host indisponível";\n$userId = $_SESSION["user_id"] ?? null;\n\necho "Erro: {$erro}" . PHP_EOL;\necho "Host: {$host}" . PHP_EOL;\necho "User ID: " . ($userId ?? "não autenticado") . PHP_EOL;',
					output:
						"Erro: senha_incorreta\nHost: localhost:8000\nUser ID: não autenticado",
					tags: ["php", "superglobal", "chave-dinamica", "get", "server", "session"],
				},
			],
		},
		{
			id: "boas-praticas",
			name: "13. Boas práticas",
			layout: "single",
			entries: [
				{
					title: "Checklist para usar superglobais com clareza e segurança",
					kicker: "Validação e origem de dado explícita reduzem bugs e falhas",
					description:
						"Essas práticas evitam warning, melhoram leitura do código e reduzem risco com entrada externa.",
					contentBlocks: [
						{
							type: "checklist-block",
							title: "Antes de subir para produção",
							items: [
								"Nunca confiar diretamente em dados de `$_GET`, `$_POST`, `$_COOKIE` ou `$_FILES`.",
								"Validar e sanitizar dados de entrada conforme o contexto.",
								"Verificar se a chave existe com `isset()` ou fallback com `??`.",
								"Evitar `$_REQUEST` em projetos organizados.",
								"Evitar `$GLOBALS` quando possível.",
								"Não salvar dados sensíveis em cookies comuns.",
								"Usar `$_ENV` ou configuração segura para segredos.",
								"Não usar `$_SERVER['PHP_SELF']` direto em HTML sem escape.",
							],
						},
						{
							type: "context-block",
							variant: "good-practice",
							label: "Resumo:",
							text: "superglobal facilita acesso, mas segurança vem de validação, origem explícita e saída escapada.",
						},
					],
					tags: ["php", "boas-praticas", "seguranca", "superglobais", "validacao", "sanitize"],
				},
			],
		},
		{
			id: "erros-comuns",
			name: "14. Erros comuns",
			layout: "single",
			entries: [
				{
					title: "Falhas frequentes ao trabalhar com superglobais",
					kicker: "Erros simples que geram warning, bug e brecha de segurança",
					description:
						"Os problemas abaixo aparecem com frequência em código PHP de produção e são fáceis de evitar com pequenas regras de higiene.",
					descriptionTone: "warn",
					contentBlocks: [
						{
							type: "checklist-block",
							title: "Erros que mais aparecem",
							items: [
								"Acessar chave inexistente e gerar warning.",
								"Confundir `$_GET` com rota de aplicação.",
								"Achar que `$_POST` é automaticamente seguro.",
								"Usar `$_REQUEST` sem saber de onde veio o dado.",
								"Confiar no `type` de `$_FILES` sem validação real.",
								"Usar `$_SERVER['HTTPS']` sem verificar se a chave existe.",
								"Confundir superglobal com constante.",
							],
						},
						{
							type: "context-block",
							variant: "common-error",
							label: "Atenção:",
							text: "o warning de chave inexistente costuma ser sinal de ausência de validação de entrada.",
						},
					],
					tags: ["php", "erros-comuns", "warning", "superglobais", "seguranca", "validacao"],
				},
			],
		},
		{
			id: "exemplo-pratico-completo",
			name: "15. Exemplo prático completo",
			layout: "single",
			entries: [
				{
					title: "Visão geral curta com request-info.php, login.php e upload.php",
					kicker: "Como as superglobais aparecem no fluxo real",
					description:
						"Esse exemplo conecta leitura de query string, método da requisição, sessão de login, cookie e upload com validação básica.",
					contentBlocks: [
						{
							type: "flow-steps",
							title: "Fluxo resumido",
							steps: [
								"`request-info.php` lê `$_SERVER`, `$_GET` e `$_COOKIE` com fallback seguro.",
								"`login.php` valida `$_POST`, inicia sessão e salva usuário em `$_SESSION`.",
								"`upload.php` valida `$_FILES` por erro, tamanho e MIME.",
							],
						},
						{
							type: "reference-card",
							title: "Consulta rápida",
							items: [
								"`$_GET['error'] ?? ''` evita warning de chave ausente.",
								"`$_SERVER['REQUEST_METHOD']` separa GET de POST.",
								"`session_start()` deve vir antes de usar `$_SESSION`.",
							],
						},
					],
					code: '<?php\n// request-info.php\n$metodo = $_SERVER["REQUEST_METHOD"] ?? "CLI";\n$host = $_SERVER["HTTP_HOST"] ?? "localhost";\n$uri = $_SERVER["REQUEST_URI"] ?? "/";\n$erro = $_GET["error"] ?? "nenhum";\n$tema = $_COOKIE["tema"] ?? "light";\n\n$isHttps = (!empty($_SERVER["HTTPS"]) && $_SERVER["HTTPS"] !== "off")\n    || (($_SERVER["SERVER_PORT"] ?? "") === "443");\n\necho "Método: {$metodo}" . PHP_EOL;\necho "Host: {$host}" . PHP_EOL;\necho "URI: {$uri}" . PHP_EOL;\necho "Erro query string: {$erro}" . PHP_EOL;\necho "Tema por cookie: {$tema}" . PHP_EOL;\necho "HTTPS ativo: " . ($isHttps ? "sim" : "não") . PHP_EOL;\n\n// login.php\nsession_start();\n\nif (($_SERVER["REQUEST_METHOD"] ?? "GET") === "POST") {\n    $email = trim($_POST["email"] ?? "");\n    $senha = $_POST["senha"] ?? "";\n\n    if ($email === "ana@empresa.com" && $senha === "123456") {\n        $_SESSION["user_id"] = 1;\n        $_SESSION["user_nome"] = "Ana";\n\n        echo "Login OK para " . ($_SESSION["user_nome"] ?? "usuário") . PHP_EOL;\n    }\n}\n\n// upload.php\nif (($_SERVER["REQUEST_METHOD"] ?? "GET") === "POST" && isset($_FILES["arquivo"])) {\n    $arquivo = $_FILES["arquivo"];\n\n    if (($arquivo["error"] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {\n        exit("Falha no upload.");\n    }\n\n    if (($arquivo["size"] ?? 0) > 2 * 1024 * 1024) {\n        exit("Arquivo maior que 2MB.");\n    }\n\n    $mime = mime_content_type($arquivo["tmp_name"] ?? "");\n\n    if (!in_array($mime, ["image/jpeg", "image/png"], true)) {\n        exit("Formato não permitido.");\n    }\n\n    echo "Arquivo válido para processamento." . PHP_EOL;\n}',
					output:
						"Método: GET\nHost: localhost:8000\nURI: /request-info.php?error=senha_incorreta\nErro query string: senha_incorreta\nTema por cookie: dark\nHTTPS ativo: não\nLogin OK para Ana\nArquivo válido para processamento.",
					tags: ["php", "exemplo-pratico", "server", "get", "post", "files"],
				},
			],
		},
	],
};
