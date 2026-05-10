window.DOC_DATA_REGISTRY = window.DOC_DATA_REGISTRY || {};
window.DOC_DATA_REGISTRY["php-erros-excecoes"] = {
	id: "php-erros-excecoes",
	title: "PHP: Erros e exceções",
	subtitle:
		"Guia prático para modelar falhas com Throwable, controlar fluxo com try/catch/finally e não vazar detalhes internos ao cliente.",
	searchPlaceholder: "Buscar exceção, Throwable, try/catch, throw ou palavra...",
	shortcutHint: "Atalho: pressione / para focar a busca.",
	codeLanguage: "php",
	defaultSectionLayout: "single",
	quickStart: {
		title: "Como testar os exemplos desta documentação",
		kicker: "Requisitos e execução no terminal",
		description:
			"Use PHP CLI. Para trechos que simulam saída HTTP, o foco é o padrão de código; em projeto real o mesmo fluxo roda atrás de Apache, Nginx ou servidor embutido.",
		steps: [
			"Confirme o PHP com `php --version`.",
			"Crie `erros.php` e cole um exemplo desta página.",
			"Execute com `php erros.php` e observe a saída no terminal.",
			"Para depuração linha a linha, use a documentação `PHP: Debugging` no hub.",
		],
		codeLanguage: "shell",
		code: "php --version\nphp erros.php",
		callout: {
			type: "hint",
			label: "Documentação relacionada:",
			text: "combine este guia com `PHP: Debugging` para investigar estado e com `PHP: Headers HTTP` ao devolver JSON de erro com status correto.",
		},
	},
	sections: [
		{
			id: "conceitos-throwable",
			name: "Conceitos: Throwable, Exception e Error",
			layout: "single",
			entries: [
				{
					title: "Throwable unifica Exception e Error",
					kicker: "Base para decidir o que capturar",
					description:
						"A partir do PHP 7, erros fatais muitas vezes viram objetos `Error` que implementam `Throwable`, assim como `Exception`. Por isso `catch (Throwable $e)` captura quase tudo que pode ser lançado como objeto. Ainda existem avisos/notices antigos que não viram exceção até você configurar um handler; o fluxo típico de API moderna combina exceções explícitas com validação antes do processamento.",
					descriptionTone: "default",
					code: '<?php\n// Exception: falhas de regra de negócio ou contrato que você modela no código.\n// Error: erros internos do motor (TypeError, ArgumentCountError, etc.).\n\nfunction exemploThrowable(int $id): void\n{\n    if ($id <= 0) {\n        throw new InvalidArgumentException("ID deve ser positivo");\n    }\n\n    echo "Processado: {$id}" . PHP_EOL;\n}\n\ntry {\n    exemploThrowable(-1);\n} catch (Throwable $e) {\n    echo "Capturado: " . $e::class . " — " . $e->getMessage() . PHP_EOL;\n}\n\ntry {\n    exemploThrowable(5);\n} catch (Throwable $e) {\n    echo "Não deveria entrar aqui" . PHP_EOL;\n}',
					output: "Capturado: InvalidArgumentException — ID deve ser positivo\nProcessado: 5",
					tags: [
						"php",
						"throwable",
						"exception",
						"error",
						"conceito",
						"base",
					],
					callout: {
						type: "hint",
						label: "Regra prática:",
						text: "em bibliotecas públicas prefira tipos específicos (`InvalidArgumentException`, etc.); em fronteira HTTP, muitas vezes você centraliza em um único tradutor para resposta JSON.",
					},
				},
				{
					title: "Diferença entre erro recuperável e bug de tipo",
					kicker: "Exception comunica regra; Error sinaliza uso incorreto",
					description:
						"`InvalidArgumentException` costuma indicar entrada inválida que o chamador pode corrigir ou exibir ao utilizador. `TypeError` indica que o programa violou uma assinatura (tipo errado em chamada). Tratar os dois como `Throwable` evita página em branco, mas a mensagem enviada ao cliente deve ser genérica; detalhes ficam em log.",
					descriptionTone: "default",
					code: '<?php\n// $a: dividendo; $b: divisor\nfunction dividir(float $a, float $b): float\n{\n    if ($b === 0.0) {\n        throw new RuntimeException("Divisor não pode ser zero");\n    }\n    return $a / $b;\n}\n\ntry {\n    echo dividir(10, 0) . PHP_EOL;\n} catch (RuntimeException $e) {\n    echo "Regra violada: " . $e->getMessage() . PHP_EOL;\n}\n\ntry {\n    dividir("dez", 2); // TypeError em tempo de execução\n} catch (Throwable $e) {\n    echo "Falha de tipo ou execução: " . $e::class . PHP_EOL;\n}',
					output: "Regra violada: Divisor não pode ser zero\nFalha de tipo ou execução: TypeError",
					tags: [
						"php",
						"typeerror",
						"runtimeexception",
						"regra",
						"tipo",
					],
				},
			],
		},
		{
			id: "try-catch-finally",
			name: "try, catch e finally",
			layout: "single",
			entries: [
				{
					title: "Fluxo básico e finally para limpeza",
					kicker: "Garantir fechamento mesmo quando há return ou throw",
					description:
						"O bloco `finally` executa depois de `try` e `catch`, mesmo se houver `return` dentro deles. Use para fechar recursos ou medir tempo. Múltiplos `catch` devem ir do tipo mais específico para o mais genérico.",
					descriptionTone: "default",
					code: '<?php\nfunction operacaoComRecurso(): string\n{\n    $recurso = fopen("php://memory", "r+");\n    if ($recurso === false) {\n        throw new RuntimeException("Não foi possível abrir recurso");\n    }\n\n    try {\n        fwrite($recurso, "dados");\n        rewind($recurso);\n        $conteudo = stream_get_contents($recurso);\n        if ($conteudo === false || $conteudo === "") {\n            throw new RuntimeException("Leitura vazia");\n        }\n        return strtoupper($conteudo);\n    } catch (Throwable $e) {\n        echo "Erro durante uso: " . $e->getMessage() . PHP_EOL;\n        throw $e;\n    } finally {\n        fclose($recurso);\n        echo "Recurso fechado." . PHP_EOL;\n    }\n}\n\ntry {\n    echo "Resultado: " . operacaoComRecurso() . PHP_EOL;\n} catch (Throwable) {\n    echo "Operação abortada." . PHP_EOL;\n}',
					output: "Resultado: DADOS\nRecurso fechado.",
					tags: [
						"php",
						"try",
						"catch",
						"finally",
						"fluxo",
						"recurso",
					],
				},
				{
					title: "Múltiplos catch e ordem correta",
					kicker: "Do específico para o genérico",
					description:
						"O PHP avalia `catch` na ordem declarada. Coloque `InvalidArgumentException` antes de `Exception` e ambos antes de `Throwable` se misturar tipos. Um `catch` genérico no fim evita silêncio acidental em blocos vazios.",
					descriptionTone: "warn",
					code: '<?php\nfunction validarEmail(string $email): void\n{\n    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {\n        throw new InvalidArgumentException("E-mail inválido");\n    }\n}\n\ntry {\n    validarEmail("sem-arroba");\n} catch (InvalidArgumentException $e) {\n    echo "Entrada: " . $e->getMessage() . PHP_EOL;\n} catch (Exception $e) {\n    echo "Outra Exception: " . $e->getMessage() . PHP_EOL;\n} catch (Throwable $e) {\n    echo "Demais falhas: " . $e::class . PHP_EOL;\n}',
					output: "Entrada: E-mail inválido",
					tags: [
						"php",
						"catch",
						"ordem",
						"invalidargumentexception",
						"exception",
					],
					callout: {
						type: "warn",
						label: "Evite:",
						text: "`catch (Throwable $e) { }` vazio: engole falhas e dificulta diagnóstico. Registre ou relance.",
					},
				},
			],
		},
		{
			id: "lancar-customizar",
			name: "Lançar e customizar exceções",
			layout: "single",
			entries: [
				{
					title: "throw e classes de exceção do domínio",
					kicker: "Mensagens claras para log; códigos estáveis para API",
					description:
						"Use `throw` quando uma pré-condição falha ou um serviço externo retorna estado inaceitável. Classes próprias estendendo `Exception` permitem propriedades extras (código de erro de negócio) sem acoplar mensagem humana ao contrato da API.",
					descriptionTone: "default",
					code: '<?php\nfinal class PagamentoRecusadoException extends Exception\n{\n    public string $codigoGateway;\n\n    public function __construct(\n        string $message = "Pagamento recusado",\n        string $codigoGateway = "DECLINED",\n        int $code = 0,\n        ?Throwable $previous = null\n    ) {\n        $this->codigoGateway = $codigoGateway;\n        parent::__construct($message, $code, $previous);\n    }\n}\n\nfunction cobrarCartao(bool $aprovado): void\n{\n    if (!$aprovado) {\n        throw new PagamentoRecusadoException(\n            "Gateway retornou recusa",\n            "GW_402"\n        );\n    }\n}\n\ntry {\n    cobrarCartao(false);\n} catch (PagamentoRecusadoException $e) {\n    echo $e->getMessage() . " | código: " . $e->codigoGateway . PHP_EOL;\n}',
					output: "Gateway retornou recusa | código: GW_402",
					tags: [
						"php",
						"throw",
						"custom",
						"dominio",
						"exception",
					],
				},
			],
		},
		{
			id: "encadear-relancar",
			name: "Encadear e relançar",
			layout: "single",
			entries: [
				{
					title: "Exception anterior e wrapping",
					kicker: "Preservar causa ao traduzir erro de baixo nível",
					description:
						"Passe a exceção original como `$previous` ao criar uma nova. Assim o stack trace completo permanece em `$e->getPrevious()` e ferramentas de log mostram a cadeia. Relançar com `throw $e` após log local também é comum.",
					descriptionTone: "default",
					code: '<?php\nfunction camadaBaixa(): never\n{\n    throw new RuntimeException("Falha de rede simulada");\n}\n\nfunction camadaAlta(): never\n{\n    try {\n        camadaBaixa();\n    } catch (Throwable $e) {\n        throw new RuntimeException("Serviço indisponível", 0, $e);\n    }\n}\n\ntry {\n    camadaAlta();\n} catch (Throwable $e) {\n    echo "Topo: " . $e->getMessage() . PHP_EOL;\n    $prev = $e->getPrevious();\n    if ($prev instanceof Throwable) {\n        echo "Causa: " . $prev->getMessage() . PHP_EOL;\n    }\n}',
					output: "Topo: Serviço indisponível\nCausa: Falha de rede simulada",
					tags: [
						"php",
						"previous",
						"chain",
						"wrap",
						"causa",
					],
				},
			],
		},
		{
			id: "apis-json",
			name: "APIs e JSON de erro",
			layout: "single",
			entries: [
				{
					title: "Padronizar corpo de erro sem expor stack",
					kicker: "Cliente recebe código estável; log guarda detalhe",
					description:
						"Em APIs, combine código HTTP adequado (4xx validação, 5xx falha interna) com JSON com campos como `error`, `code` e opcionalmente `details` controlados. Não envie `getTraceAsString()` ao cliente. Para cabeçalhos e status, alinhe com `PHP: Headers HTTP com header()`; para `json_encode`, flags e `JsonException`, use `PHP: JSON (encode e decode)` no hub.",
					descriptionTone: "default",
					code: '<?php\nfunction respostaErroJson(int $statusHttp, string $codigo, string $mensagemPublica, ?string $detalheLog = null): string\n{\n    if ($detalheLog !== null) {\n        error_log("[api] {$codigo}: {$detalheLog}");\n    }\n\n    $payload = [\n        "ok" => false,\n        "error" => [\n            "code" => $codigo,\n            "message" => $mensagemPublica,\n        ],\n    ];\n\n    return json_encode($payload, JSON_THROW_ON_ERROR);\n}\n\ntry {\n    throw new InvalidArgumentException("Campo obrigatório ausente: nome");\n} catch (InvalidArgumentException $e) {\n    $json = respostaErroJson(400, "VALIDATION_ERROR", "Dados inválidos", $e->getMessage());\n    echo $json . PHP_EOL;\n}',
					output: '{"ok":false,"error":{"code":"VALIDATION_ERROR","message":"Dados inválidos"}}',
					tags: [
						"php",
						"api",
						"json",
						"http",
						"erro",
						"seguranca",
					],
					callout: {
						type: "hint",
						label: "Lembrete:",
						text: "defina `Content-Type: application/json` e o status antes do corpo (doc de headers); use a doc de JSON para serialização consistente e validação após decode.",
					},
				},
			],
		},
		{
			id: "producao-desenvolvimento",
			name: "Produção vs desenvolvimento",
			layout: "single",
			entries: [
				{
					title: "display_errors, log_errors e o que o cliente vê",
					kicker: "Desenvolvimento verboso; produção contida",
					description:
						"Em desenvolvimento, `display_errors=On` ajuda. Em produção, desligue exibição de erros ao utilizador final e use `log_errors` com destino seguro. Handlers globais (`set_exception_handler`) podem converter qualquer exceção não capturada em resposta 500 padronizada.",
					descriptionTone: "warn",
					code: '<?php\n// Exemplo didático: em produção você configuraria via php.ini ou bootstrap.\n// ini_set("display_errors", "0");\n// ini_set("log_errors", "1");\n\nfunction tratarNaoCapturada(Throwable $e): void\n{\n    error_log("Não capturada: " . $e->getMessage());\n    http_response_code(500);\n    header("Content-Type: application/json; charset=UTF-8");\n    echo json_encode([\n        "ok" => false,\n        "error" => ["code" => "INTERNAL", "message" => "Erro interno"],\n    ]);\n}\n\n// set_exception_handler("tratarNaoCapturada"); // ative no front controller real\n\necho "Handler registrado no bootstrap da aplicação." . PHP_EOL;',
					output: "Handler registrado no bootstrap da aplicação.",
					tags: [
						"php",
						"producao",
						"display_errors",
						"log",
						"handler",
					],
					callout: {
						type: "danger",
						label: "Crítico:",
						text: "nunca exponha caminhos de ficheiro, queries SQL completas ou segredos em JSON ou HTML de erro em produção.",
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
					title: "Quando exceção e quando retorno de resultado",
					kicker: "Exceção para fluxo excecional; resultado para caminhos normais",
					description:
						"Exceções custam e quebram o fluxo linear; use para situações que não deveriam ocorrer se o contrato fosse respeitado. Para \"não encontrado\" em consultas frequentes, alguns times preferem `null` ou tipo `Result` em vez de exceção. O importante é ser consistente no projeto.",
					descriptionTone: "default",
					code: '<?php\nfunction buscarUsuario(?int $id): ?array\n{\n    if ($id === null) {\n        return null; // caminho esperado: sem id, sem utilizador\n    }\n    if ($id <= 0) {\n        throw new InvalidArgumentException("ID inválido");\n    }\n    return ["id" => $id, "nome" => "Ana"];\n}\n\nvar_export(buscarUsuario(null));\necho PHP_EOL;\nvar_export(buscarUsuario(7));\necho PHP_EOL;\ntry {\n    var_export(buscarUsuario(-3));\n} catch (InvalidArgumentException $e) {\n    echo "Erro: " . $e->getMessage();\n}',
					output: "NULL\narray (\n  'id' => 7,\n  'nome' => 'Ana',\n)\nErro: ID inválido",
					tags: [
						"php",
						"boas-praticas",
						"retorno",
						"excecao",
						"contrato",
					],
				},
			],
		},
		{
			id: "erros-comuns",
			name: "Erros comuns",
			layout: "single",
			entries: [
				{
					title: "Capturar largo demais e engolir a falha",
					kicker: "Throwable genérico sem log nem relançamento",
					description:
						"Capturar `Throwable` e não fazer nada útil mascara bugs. Outro padrão ruim é converter tudo em mensagem genérica sem identificador de correlação para achar o evento no log.",
					descriptionTone: "warn",
					code: '<?php\n// Ruim: silencia o problema.\nfunction exemploRuim(): void\n{\n    try {\n        throw new RuntimeException("falha real");\n    } catch (Throwable) {\n        // vazio\n    }\n}\n\n// Melhor: registar e transformar em erro de sistema conhecido.\nfunction exemploMelhor(): void\n{\n    try {\n        throw new RuntimeException("falha real");\n    } catch (Throwable $e) {\n        $id = "9f3a2c1b"; // id fixo para o exemplo na documentação\n        error_log("[{$id}] " . $e->getMessage());\n        throw new RuntimeException("Operação falhou (ref {$id})", 0, $e);\n    }\n}\n\ntry {\n    exemploMelhor();\n} catch (RuntimeException $e) {\n    echo $e->getMessage() . PHP_EOL;\n}',
					output: "Operação falhou (ref 9f3a2c1b)",
					tags: [
						"php",
						"erros-comuns",
						"catch",
						"log",
						"correlacao",
					],
					callout: {
						type: "hint",
						label: "Correção:",
						text: "o exemplo imprime uma referência; em produção devolva esse id ao cliente e guarde stack só no servidor.",
					},
				},
			],
		},
	],
};
