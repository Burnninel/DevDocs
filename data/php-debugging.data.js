window.DOC_DATA_REGISTRY = window.DOC_DATA_REGISTRY || {};
window.DOC_DATA_REGISTRY["php-debugging"] = {
	id: "php-debugging",
	title: "PHP: Debugging",
	subtitle:
		"Guia prático para diagnosticar erros em PHP com método, contexto e exemplos que resolvem problemas reais.",
	searchPlaceholder: "Buscar debug, var_dump, dd, breakpoint ou palavra...",
	shortcutHint: "Atalho: pressione / para focar a busca.",
	codeLanguage: "php",
	defaultSectionLayout: "single",
	quickStart: {
		title: "Como testar os exemplos desta documentação",
		kicker: "Requisitos e execução no terminal",
		description:
			"Você pode testar todos os exemplos com PHP CLI. Em temas de breakpoint, o ideal é abrir o mesmo código no VS Code com Xdebug configurado.",
		steps: [
			"Verifique se o PHP está disponível com `php --version`.",
			"Crie um arquivo, por exemplo `debug.php`, e cole um exemplo desta página.",
			"Execute no terminal com `php debug.php`.",
			"Para breakpoints, abra o arquivo no VS Code e rode em modo Debug.",
		],
		codeLanguage: "shell",
		code: "php --version\nphp debug.php",
		callout: {
			type: "hint",
			label: "Dica:",
			text: "debug eficiente depende de contexto: olhe entrada, processamento e saída antes de alterar a regra.",
		},
	},
	sections: [
		{
			id: "o-que-e-debug",
			name: "O que é Debug",
			layout: "single",
			entries: [
				{
					title: "Debug é observar o estado real antes de corrigir",
					kicker: "Encontrar causa raiz em vez de corrigir no escuro",
					description:
						"Debug é o processo de inspecionar valores, fluxo e contexto para descobrir por que o resultado está errado. Use quando o comportamento não bate com a regra de negócio. O objetivo não é só ver dados, mas confirmar onde a lógica quebrou para corrigir com segurança.",
					descriptionTone: "default",
					code: '<?php\n$subtotal = 150.00;\n$frete = 20.00;\n\n$totalCalculado = $subtotal - $frete; // Simula um bug de regra: deveria somar\n\necho "Total enviado para cobrança: R$ {$totalCalculado}" . PHP_EOL;\n\n$contexto = [\n    "subtotal" => $subtotal,\n    "frete" => $frete,\n    "operacao_aplicada" => "subtotal - frete", // Mostra exatamente a regra executada\n];\nprint_r($contexto); // Debug revela o estado antes da correção\n\n$totalCorreto = $subtotal + $frete; // Corrige depois do diagnóstico\necho "Total correto: R$ {$totalCorreto}" . PHP_EOL;',
					output: "Total enviado para cobrança: R$ 130\nArray\n(\n    [subtotal] => 150\n    [frete] => 20\n    [operacao_aplicada] => subtotal - frete\n)\nTotal correto: R$ 170",
					tags: [
						"php",
						"debug",
						"conceito",
						"diagnostico",
						"causa-raiz",
						"base",
					],
					callout: {
						type: "hint",
						label: "Regra prática:",
						text: "primeiro confirme o que o código está fazendo agora; depois aplique a correção com base nessa evidência.",
					},
				},
				{
					title: "Debug inspeciona estado; exceções modelam falha de fluxo",
					kicker: "Complemento à documentação de erros e exceções",
					description:
						"Debug responde \"o que está na variável agora?\". Exceções respondem \"esta operação falhou e o fluxo deve parar ou ser traduzido\". Depois de entender a causa com debug, use `try/catch` e tipos de exceção para tratar o caso de forma repetível e segura em produção. No hub, abra também `PHP: Erros e exceções` para padrões de `Throwable`, relançamento e resposta JSON sem vazar stack.",
					descriptionTone: "default",
					code: '<?php\nfunction calcularDesconto(float $valor, float $percentual): float\n{\n    if ($percentual < 0 || $percentual > 100) {\n        throw new InvalidArgumentException("Percentual fora do intervalo 0 a 100");\n    }\n    return $valor * ($percentual / 100.0);\n}\n\ntry {\n    $desconto = calcularDesconto(200.0, 150.0);\n    echo "Desconto: {$desconto}" . PHP_EOL;\n} catch (InvalidArgumentException $e) {\n    echo "Tratado: " . $e->getMessage() . PHP_EOL; // Fluxo controlado após regra violada\n}',
					output: "Tratado: Percentual fora do intervalo 0 a 100",
					tags: [
						"php",
						"debug",
						"excecao",
						"fluxo",
						"tratamento",
						"invalidargumentexception",
					],
					callout: {
						type: "hint",
						label: "Ordem sugerida:",
						text: "1) reproduza com dados mínimos; 2) inspecione com debug; 3) corrija a regra; 4) onde fizer sentido, substitua retornos mágicos por exceções ou resultados tipados.",
					},
				},
			],
		},
		{
			id: "debug-basico",
			name: "Debug básico (echo, print_r, var_dump)",
			layout: "single",
			entries: [
				{
					title: "Quando usar echo, print_r e var_dump",
					kicker: "Escolher a ferramenta certa acelera o diagnóstico",
					description:
						"`echo` é ideal para checar valores rápidos em texto. `print_r` funciona melhor para visualizar arrays e objetos de forma legível. `var_dump` é o mais completo quando você precisa confirmar tipo, tamanho e conteúdo exato. Escolher bem evita ruído e reduz tempo de análise.",
					descriptionTone: "default",
					code: '<?php\n$pedido = [\n    "id" => 501,\n    "status" => "pago",\n    "itens" => [\n        ["nome" => "Mouse", "qtd" => 1],\n        ["nome" => "Teclado", "qtd" => 1],\n    ],\n    "total" => 199.90,\n];\n\necho "Status do pedido: {$pedido["status"]}" . PHP_EOL; // echo para checagem textual rápida\nprint_r($pedido["itens"]); // print_r para leitura de estrutura\nvar_dump($pedido["total"]); // var_dump para confirmar tipo e valor exato',
					output: "Status do pedido: pago\nArray\n(\n    [0] => Array\n        (\n            [nome] => Mouse\n            [qtd] => 1\n        )\n    [1] => Array\n        (\n            [nome] => Teclado\n            [qtd] => 1\n        )\n)\nfloat(199.9)",
					tags: [
						"php",
						"debug",
						"echo",
						"print_r",
						"var_dump",
						"inspecao",
					],
				},
			],
		},
		{
			id: "parar-execucao",
			name: "Parar execução (die, exit)",
			layout: "single",
			entries: [
				{
					title: "die e exit para isolar exatamente onde o fluxo quebra",
					kicker: "Parar no ponto suspeito reduz ruído",
					description:
						"Use `die` ou `exit` quando você precisa interromper a execução em um trecho específico para confirmar uma hipótese. Isso é útil em fluxos longos, onde o erro aparece no final, mas nasce antes. O motivo é simples: parar cedo ajuda a focar no ponto real do problema.",
					descriptionTone: "default",
					code: '<?php\n$payload = [\n    "nome" => "Ana",\n    // "email" => "ana@email.com",\n];\n\necho "Iniciando validação..." . PHP_EOL;\n\nif (!isset($payload["email"])) {\n    die("Parou no debug: campo email ausente" . PHP_EOL); // Interrompe no ponto do erro\n}\n\necho "Fluxo continua normalmente" . PHP_EOL;',
					output: "Iniciando validação...\nParou no debug: campo email ausente",
					tags: [
						"php",
						"debug",
						"die",
						"exit",
						"fluxo",
						"validacao",
					],
					callout: {
						type: "warn",
						label: "Atenção:",
						text: "remova `die` e `exit` depois da investigação para não interromper o fluxo em produção.",
					},
				},
			],
		},
		{
			id: "dd-dump-and-die",
			name: "dd() (Dump and Die)",
			layout: "single",
			entries: [
				{
					title: "dd para inspecionar e parar em uma única chamada",
					kicker: "Atalho útil quando você precisa de resposta imediata",
					description:
						"`dd` significa dump and die: exibe o valor e encerra a execução. Em frameworks como Laravel, esse helper já vem pronto. Em PHP puro, você pode criar uma versão simples. Use quando precisar congelar o estado naquele ponto e evitar que o restante do código mascare o problema.",
					descriptionTone: "default",
					code: '<?php\nfunction dd(mixed $valor): never\n{\n    var_dump($valor); // Dump completo para tipo e conteúdo\n    exit(1); // Die para parar no ponto exato\n}\n\n$respostaApi = [\n    "ok" => false,\n    "erro" => "Token expirado",\n    "codigo" => 401,\n];\n\ndd($respostaApi); // Diagnostica e interrompe no mesmo comando\n\necho "Esta linha não será executada" . PHP_EOL;',
					output: "array(3) {\n  [\"ok\"]=>\n  bool(false)\n  [\"erro\"]=>\n  string(14) \"Token expirado\"\n  [\"codigo\"]=>\n  int(401)\n}",
					tags: [
						"php",
						"debug",
						"dd",
						"dump-and-die",
						"inspecao",
						"atalho",
					],
					callout: {
						type: "hint",
						label: "Quando usar:",
						text: "ótimo para investigação rápida em ambiente local; para diagnóstico contínuo em produção, prefira logging estruturado.",
					},
				},
			],
		},
		{
			id: "debug-arrays-objetos",
			name: "Debug com arrays e objetos",
			layout: "single",
			entries: [
				{
					title: "Inspecionar estrutura profunda sem se perder",
					kicker: "Focar no trecho crítico evita excesso de informação",
					description:
						"Em dados aninhados, debug eficiente não é imprimir tudo sempre, e sim olhar os blocos certos. Use `print_r` para partes específicas do array e `var_dump` quando precisar confirmar tipo e forma do objeto. Isso ajuda a encontrar inconsistências sem gerar ruído desnecessário.",
					descriptionTone: "default",
					code: '<?php\nclass ClienteDTO\n{\n    public function __construct(\n        public int $id,\n        public string $nome\n    ) {}\n}\n\n$pedido = [\n    "cliente" => ["id" => 10, "nome" => "Ana"],\n    "itens" => [\n        ["sku" => "MOU-01", "qtd" => 2],\n        ["sku" => "TEC-02", "qtd" => 1],\n    ],\n];\n\n$cliente = new ClienteDTO($pedido["cliente"]["id"], $pedido["cliente"]["nome"]);\n\nprint_r($pedido["itens"]); // Foca só no trecho suspeito do array\nvar_dump($cliente); // Confirma tipo e propriedades do objeto',
					output: "Array\n(\n    [0] => Array\n        (\n            [sku] => MOU-01\n            [qtd] => 2\n        )\n    [1] => Array\n        (\n            [sku] => TEC-02\n            [qtd] => 1\n        )\n)\nobject(ClienteDTO)#1 (2) {\n  [\"id\"]=>\n  int(10)\n  [\"nome\"]=>\n  string(3) \"Ana\"\n}",
					tags: [
						"php",
						"debug",
						"array",
						"objeto",
						"print_r",
						"var_dump",
					],
				},
			],
		},
		{
			id: "debug-apis-json",
			name: "Debug em APIs (JSON)",
			layout: "single",
			entries: [
				{
					title: "Validar status, body bruto e parsing JSON",
					kicker: "Diagnóstico completo de integração HTTP",
					description:
						"Quando uma integração falha, você precisa olhar três pontos: código HTTP, body bruto e resultado do `json_decode`. Use essa sequência para diferenciar erro de transporte, erro de contrato e erro de parsing. Isso evita correções no lugar errado. Para flags de `json_encode`/`json_decode`, `JsonException` e validação de payload, abra também `PHP: JSON (encode e decode)` no hub.",
					descriptionTone: "default",
					code: '<?php\n$statusCode = 422;\n$bodyBruto = \'{"erro":"E-mail inválido","campos":{"email":"formato inválido"}}\';\n\necho "HTTP: {$statusCode}" . PHP_EOL;\necho "Body bruto: {$bodyBruto}" . PHP_EOL; // Primeiro confirme o retorno original\n\n$dados = json_decode($bodyBruto, true);\n\nif (json_last_error() !== JSON_ERROR_NONE) {\n    echo "Falha no decode: " . json_last_error_msg() . PHP_EOL;\n    exit(1);\n}\n\nprint_r($dados["campos"]); // Depois do decode, foque no campo de erro útil\n\n$jsonInvalido = \'{"ok":true\';\njson_decode($jsonInvalido, true);\necho "Erro no JSON inválido: " . json_last_error_msg() . PHP_EOL; // Mostra erro real de sintaxe',
					output: "HTTP: 422\nBody bruto: {\"erro\":\"E-mail inválido\",\"campos\":{\"email\":\"formato inválido\"}}\nArray\n(\n    [email] => formato inválido\n)\nErro no JSON inválido: Syntax error",
					tags: [
						"php",
						"debug",
						"api",
						"json",
						"json_decode",
						"integracao",
					],
					callout: {
						type: "hint",
						label: "Fluxo recomendado:",
						text: "registre request, status code e body em ambiente de desenvolvimento antes de alterar a regra de negócio.",
					},
				},
			],
		},
		{
			id: "breakpoints-vscode",
			name: "Breakpoints no VS Code",
			layout: "single",
			entries: [
				{
					title: "Configuração mínima do Xdebug no PHP",
					kicker: "Pré-requisito para o breakpoint funcionar no VS Code",
					description:
						"Breakpoint no VS Code depende do Xdebug ativo no PHP. Use esse setup quando você precisa pausar execução sem poluir o código com `echo` e `var_dump`. Isso é importante porque sem o Xdebug o VS Code não consegue interceptar a execução linha a linha.",
					descriptionTone: "default",
					codeLanguage: "ini",
					code: '; php.ini\nzend_extension=xdebug\nxdebug.mode=debug ; Ativa modo de depuração\nxdebug.start_with_request=yes ; Inicia sessão de debug quando o script roda\nxdebug.client_host=127.0.0.1 ; Endereço onde o VS Code está ouvindo\nxdebug.client_port=9003 ; Porta padrão do Xdebug 3\n\n; Verificação no terminal\nphp --ri xdebug ; Confirma se o módulo foi carregado',
					tags: [
						"php",
						"debug",
						"xdebug",
						"php.ini",
						"breakpoint",
						"configuracao",
					],
					callout: {
						type: "hint",
						label: "Onde ajustar:",
						text: "edite o `php.ini` carregado pelo seu PHP CLI (veja com `php --ini`) e reinicie o terminal após salvar.",
					},
				},
				{
					title: "Configurar o VS Code para escutar o Xdebug",
					kicker: "Arquivo launch.json com o profile correto",
					description:
						"Depois do PHP configurado, o VS Code precisa de um profile de debug. Use quando for depurar script local por breakpoint. O motivo é simples: esse profile é quem abre a sessão de escuta na porta usada pelo Xdebug.",
					descriptionTone: "default",
					codeLanguage: "json",
					code: '{\n    "version": "0.2.0",\n    "configurations": [\n        {\n            "name": "Listen for Xdebug",\n            "type": "php",\n            "request": "launch",\n            "port": 9003\n        }\n    ]\n}',
					tags: [
						"php",
						"debug",
						"vscode",
						"launch-json",
						"xdebug",
						"configuracao",
					],
					callout: {
						type: "hint",
						label: "Onde salvar:",
						text: "salve esse conteúdo em `.vscode/launch.json`, abra Run and Debug no VS Code e selecione `Listen for Xdebug`.",
					},
				},
				{
					title: "Parar linha a linha para inspecionar variáveis em tempo real",
					kicker: "Ideal para bugs de fluxo e cálculos progressivos",
					description:
						"Com o profile ativo, clique na margem da linha para criar breakpoints e inicie o debug com `F5`. Use isso quando o erro depende da sequência do fluxo. O resultado aparece no painel de debug do VS Code: variáveis em `Variables`, expressões em `Watch`, pilha em `Call Stack`, saídas de depuração em `Debug Console` e `echo` final no terminal integrado.",
					descriptionTone: "default",
					code: '<?php\n$itens = [\n    ["nome" => "Mouse", "preco" => 120.00, "qtd" => 2],\n    ["nome" => "Teclado", "preco" => 220.00, "qtd" => 1],\n];\n\n$total = 0.0;\n\nforeach ($itens as $item) { // Breakpoint 1: confira o item atual em Variables\n    $linha = $item["preco"] * $item["qtd"]; // Breakpoint 2: acompanhe o cálculo por linha no Watch\n    $total += $linha;\n}\n\necho "Total: R$ " . number_format($total, 2, ",", ".") . PHP_EOL; // Saída final aparece no terminal',
					output: "Total: R$ 460,00",
					tags: [
						"php",
						"debug",
						"breakpoint",
						"vscode",
						"xdebug",
						"watch",
					],
					callout: {
						type: "hint",
						label: "Fluxo de uso:",
						text: "1) Inicie `Listen for Xdebug` no VS Code. 2) Rode o script (`php debug.php`). 3) Use `F10` (Step Over), `F11` (Step Into) e `Shift+F11` (Step Out). 4) Veja valores em `Variables`/`Watch` e mensagens no `Debug Console`.",
					},
				},
			],
		},
		{
			id: "boas-praticas",
			name: "Boas práticas",
			layout: "single",
			entries: [
				{
					title: "Debug com contexto, controle e limpeza",
					kicker: "Diagnosticar sem contaminar o código final",
					description:
						"Boas práticas de debug reduzem retrabalho: centralize pontos de inspeção, ligue e desligue debug por ambiente e remova artefatos temporários depois da análise. Isso mantém o projeto limpo e evita vazamento de informação sensível.",
					descriptionTone: "default",
					code: '<?php\nconst DEBUG = true;\n\n// $ponto: rótulo no log; $valor: dado a inspecionar\nfunction debugLog(string $ponto, mixed $valor): void\n{\n    if (!DEBUG) {\n        return;\n    }\n\n    echo "[DEBUG] {$ponto}" . PHP_EOL;\n\n    if (is_array($valor) || is_object($valor)) {\n        print_r($valor); // Estruturas complexas ficam legíveis\n        return;\n    }\n\n    var_dump($valor); // Escalares com tipo explícito\n}\n\n$usuario = ["id" => 10, "perfil" => "admin"];\ndebugLog("payload de autenticação", $usuario);\ndebugLog("token ativo", true);',
					output: "[DEBUG] payload de autenticação\nArray\n(\n    [id] => 10\n    [perfil] => admin\n)\n[DEBUG] token ativo\nbool(true)",
					tags: [
						"php",
						"debug",
						"boas-praticas",
						"controle",
						"contexto",
						"limpeza",
					],
					callout: {
						type: "hint",
						label: "Checklist rápido:",
						text: "debug com contexto, sem excesso de dumps, com dados mascarados e sempre removido ao concluir a correção.",
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
					title: "Falhas frequentes que atrapalham o diagnóstico",
					kicker: "Evitar armadilhas economiza tempo e reduz falso positivo",
					description:
						"Erros comuns de debug incluem comparação frouxa, excesso de impressão sem foco e esquecimento de `dd`/`die` no fluxo final. Saber esses pontos evita conclusões erradas e bugs secundários criados durante a investigação.",
					descriptionTone: "warn",
					code: '<?php\n$retornoApi = "0";\n\nif ($retornoApi == false) {\n    echo "Comparação frouxa: entrou por engano" . PHP_EOL; // Erro comum: mistura tipo string com boolean\n}\n\nif ($retornoApi === false) {\n    echo "Comparação estrita: retorno realmente boolean false" . PHP_EOL;\n} else {\n    echo "Comparação estrita: valor recebido foi string \\"0\\"" . PHP_EOL; // Diagnóstico correto do tipo recebido\n}\n\n$pedido = ["id" => 321, "status" => "pago"];\n// dd($pedido); // Erro comum: esquecer dd ativo e travar o fluxo real\n\necho "Fluxo final executado" . PHP_EOL;',
					output: "Comparação frouxa: entrou por engano\nComparação estrita: valor recebido foi string \"0\"\nFluxo final executado",
					tags: [
						"php",
						"debug",
						"erros-comuns",
						"comparacao-estrita",
						"dd",
						"boas-praticas",
					],
					callout: {
						type: "danger",
						label: "Perigo:",
						text: "debug sem critério pode esconder o bug real. Sempre valide tipo, contexto e ponto exato da execução.",
					},
				},
			],
		},
	],
};
