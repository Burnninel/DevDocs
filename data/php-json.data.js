window.DOC_DATA_REGISTRY = window.DOC_DATA_REGISTRY || {};
window.DOC_DATA_REGISTRY["php-json"] = {
	id: "php-json",
	title: "PHP: JSON (encode e decode)",
	subtitle:
		"Guia prático para converter entre arrays/objetos PHP e texto JSON, usar flags, tratar erros e alinhar com respostas HTTP.",
	searchPlaceholder: "Buscar json_encode, json_decode, flags, Unicode ou palavra...",
	shortcutHint: "Atalho: pressione / para focar a busca.",
	codeLanguage: "php",
	defaultSectionLayout: "single",
	quickStart: {
		title: "Como testar os exemplos desta documentação",
		kicker: "PHP CLI",
		description:
			"Todos os exemplos rodam com `php arquivo.php`. Para ver JSON numa resposta HTTP real, combine com a documentação `PHP: Headers HTTP com header()` e um servidor embutido (`php -S`).",
		steps: [
			"Confirme o PHP com `php --version` (PHP 8.0+ recomendado para `JSON_THROW_ON_ERROR` em todos os cenários).",
			"Crie `json.php` e cole um exemplo desta página.",
			"Execute com `php json.php`.",
		],
		codeLanguage: "shell",
		code: "php --version\nphp json.php",
		callout: {
			type: "hint",
			label: "Documentação relacionada:",
			text: "`PHP: Headers HTTP` para Content-Type e ordem de saída; `PHP: Erros e exceções` para APIs que devem falhar de forma controlada com JSON.",
		},
	},
	sections: [
		{
			id: "conceitos-json",
			name: "Conceitos",
			layout: "single",
			entries: [
				{
					title: "JSON é texto; PHP trabalha com tipos nativos",
					kicker: "encode gera string; decode reconstrói estrutura",
					description:
						"JSON (JavaScript Object Notation) é um formato de texto para trocar dados. O PHP não tem tipo \"JSON\": você serializa com `json_encode` para obter uma `string` e desserializa com `json_decode` para obter `array`, `stdClass` ou tipos escalares conforme o conteúdo. Use JSON em APIs, ficheiros de configuração e integrações com serviços externos.",
					descriptionTone: "default",
					code: '<?php\n$dados = ["ok" => true, "total" => 42, "tags" => ["php", "json"]];\n\n$texto = json_encode($dados, JSON_UNESCAPED_UNICODE);\necho $texto . PHP_EOL;\n\n$volta = json_decode($texto, true);\nvar_export($volta["tags"]);\necho PHP_EOL;',
					output: '{"ok":true,"total":42,"tags":["php","json"]}\narray (\n  0 => \'php\',\n  1 => \'json\',\n)',
					tags: [
						"php",
						"json",
						"conceito",
						"encode",
						"decode",
						"api",
					],
				},
			],
		},
		{
			id: "json-encode",
			name: "json_encode",
			layout: "single",
			entries: [
				{
					title: "Flags frequentes e JSON_THROW_ON_ERROR",
					kicker: "Unicode legível, floats precisos e falha explícita",
					description:
						"`JSON_UNESCAPED_UNICODE` evita `\\uXXXX` em textos acentuados. `JSON_THROW_ON_ERROR` faz `json_encode` lançar `JsonException` em falha em vez de retornar `false`. Combine com `try/catch` para respostas de API consistentes.",
					descriptionTone: "default",
					code: '<?php\n$payload = ["mensagem" => "Ação concluída", "valor" => 10.5];\n\ntry {\n    $json = json_encode(\n        $payload,\n        JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR\n    );\n    echo $json . PHP_EOL;\n} catch (JsonException $e) {\n    echo "Falha ao serializar: " . $e->getMessage();\n}',
					output: '{"mensagem":"Ação concluída","valor":10.5}',
					tags: [
						"php",
						"json_encode",
						"flags",
						"unicode",
						"jsonexception",
					],
					callout: {
						type: "hint",
						label: "PHP 8.3+:",
						text: "existe `json_validate()` para verificar string sem decodificar o payload inteiro em estrutura.",
					},
				},
				{
					title: "Recursos não representáveis em JSON",
					kicker: "resources e tipos especiais viram null ou falham",
					description:
						"JSON não transporta `resource`. Objetos arbitrários sem `JsonSerializable` são serializados como `{}` ou propriedades públicas dependendo do contexto; prefira arrays ou DTOs explícitos para APIs.",
					descriptionTone: "warn",
					code: '<?php\nclass Ponto\n{\n    public function __construct(public int $x, public int $y) {}\n}\n\n$p = new Ponto(1, 2);\necho json_encode($p, JSON_THROW_ON_ERROR) . PHP_EOL;\n\nclass PontoJson implements JsonSerializable\n{\n    public function __construct(public int $x, public int $y) {}\n\n    public function jsonSerialize(): array\n    {\n        return ["x" => $this->x, "y" => $this->y];\n    }\n}\n\necho json_encode(new PontoJson(3, 4), JSON_THROW_ON_ERROR) . PHP_EOL;',
					output: "{}\n{\"x\":3,\"y\":4}",
					tags: [
						"php",
						"jsonserializable",
						"objeto",
						"limite",
						"encode",
					],
				},
			],
		},
		{
			id: "json-decode",
			name: "json_decode",
			layout: "single",
			entries: [
				{
					title: "Segundo parâmetro: array associativo vs objeto",
					kicker: "`true` para array; omisso ou `false` para stdClass",
					description:
						"Com `json_decode($s, true)` você obtém arrays associativos, o que costuma simplificar APIs e testes. Sem o segundo parâmetro (ou com `false`), objetos JSON viram instâncias de `stdClass`. Escolha um padrão no projeto e mantenha-o.",
					descriptionTone: "default",
					code: '<?php\n$json = \'{"id":7,"nome":"Ana","ativo":true}\';\n\n$comoArray = json_decode($json, true, 512, JSON_THROW_ON_ERROR);\necho $comoArray["nome"] . PHP_EOL;\n\n$comoObjeto = json_decode($json, false, 512, JSON_THROW_ON_ERROR);\necho $comoObjeto->nome . PHP_EOL;',
					output: "Ana\nAna",
					tags: [
						"php",
						"json_decode",
						"array",
						"stdclass",
						"associativo",
					],
				},
				{
					title: "Profundidade máxima e JSON_THROW_ON_ERROR",
					kicker: "Evitar estouro de memória com JSON profundo",
					description:
						"O terceiro argumento de `json_decode` é `depth` (padrão 512). Estruturas excessivamente aninhadas podem ser rejeitadas ajustando esse limite. Com `JSON_THROW_ON_ERROR`, erros de sintaxe viram `JsonException`.",
					descriptionTone: "default",
					code: '<?php\n$json = \'{"a":{"b":{"c":1}}}\';\n\ntry {\n    $dados = json_decode($json, true, 2, JSON_THROW_ON_ERROR);\n    var_export($dados);\n} catch (JsonException $e) {\n    echo "Erro: " . $e->getMessage();\n}',
					output: "Erro: Maximum stack depth exceeded",
					tags: [
						"php",
						"json_decode",
						"depth",
						"limite",
						"seguranca",
					],
				},
			],
		},
		{
			id: "json-last-error",
			name: "json_last_error sem exceção",
			layout: "single",
			entries: [
				{
					title: "json_last_error e json_last_error_msg",
					kicker: "Código legado ou estilo sem JSON_THROW_ON_ERROR",
					description:
						"Sem `JSON_THROW_ON_ERROR`, `json_decode` devolve `null` tanto para JSON nulo literal quanto para erro. Por isso a ordem recomendada é: decodificar, chamar `json_last_error()` e só então usar o resultado. Prefira exceções em código novo.",
					descriptionTone: "default",
					code: '<?php\n$jsonInvalido = \'{"ok":true\';\n\n$resultado = json_decode($jsonInvalido, true);\n\nif (json_last_error() !== JSON_ERROR_NONE) {\n    echo json_last_error_msg() . PHP_EOL;\n    exit(1);\n}\n\nvar_export($resultado);',
					output: "Syntax error",
					tags: [
						"php",
						"json_last_error",
						"erro",
						"decode",
						"legado",
					],
				},
			],
		},
		{
			id: "apis-resposta",
			name: "APIs e resposta HTTP",
			layout: "single",
			entries: [
				{
					title: "Montar body JSON depois dos headers corretos",
					kicker: "Alinhar com a doc de headers HTTP",
					description:
						"Em scripts web, defina `Content-Type: application/json` e o código de status antes de `echo` do JSON. Tratamento de erro com corpo JSON padronizado combina com `PHP: Erros e exceções`. Detalhes de `header()` e CORS estão em `PHP: Headers HTTP com header()` no hub.",
					descriptionTone: "default",
					code: '<?php\n// $payload: corpo da resposta; $status: código HTTP\nfunction respostaJson(array $payload, int $status = 200): void\n{\n    http_response_code($status);\n    header("Content-Type: application/json; charset=utf-8");\n    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);\n}\n\n// Em CLI este exemplo só mostra o JSON final;\n// em servidor web os headers seriam enviados antes do body.\nrespostaJson(["ok" => true, "data" => ["id" => 1]], 200);',
					output: '{"ok":true,"data":{"id":1}}',
					tags: [
						"php",
						"api",
						"http",
						"resposta",
						"header",
						"json",
					],
					callout: {
						type: "hint",
						label: "Ordem:",
						text: "nenhum `echo` antes dos headers; veja a secção sobre \"headers antes da saída\" na documentação de HTTP.",
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
					title: "Contrato estável e tipagem depois do decode",
					kicker: "Validar chaves antes de usar",
					description:
						"Após `json_decode`, verifique se chaves existem e se tipos são os esperados (`isset`, `is_int`, etc.) ou use uma camada de validação. Não confie em JSON externo sem validação: é entrada como qualquer outra.",
					descriptionTone: "default",
					code: '<?php\n$json = \'{"email":"ana@exemplo.com","idade":"30"}\';\n\n$dados = json_decode($json, true, 512, JSON_THROW_ON_ERROR);\n\nif (!isset($dados["email"], $dados["idade"])) {\n    throw new RuntimeException("Payload incompleto");\n}\n\n$idade = filter_var($dados["idade"], FILTER_VALIDATE_INT);\nif ($idade === false || $idade < 0) {\n    throw new InvalidArgumentException("Idade inválida");\n}\n\necho "OK: {$dados["email"]} tem {$idade} anos";',
					output: "OK: ana@exemplo.com tem 30 anos",
					tags: [
						"php",
						"validacao",
						"contrato",
						"seguranca",
						"json",
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
					title: "Confundir null JSON com falha de decode",
					kicker: "Sempre checar json_last_error se não usar throw",
					description:
						"Outro erro frequente é enviar UTF-8 inválido ou misturar `JSON_NUMERIC_CHECK` sem querer (strings numéricas viram número). Teste com dados reais de integração.",
					descriptionTone: "warn",
					code: '<?php\n$literalNull = "null";\n$quebrado = "{não é json";\n\n$a = json_decode($literalNull, true);\necho ($a === null ? "valor null" : "outro") . " | erro: " . json_last_error_msg() . PHP_EOL;\n\n$b = json_decode($quebrado, true);\necho ($b === null ? "valor null" : "outro") . " | erro: " . json_last_error_msg() . PHP_EOL;',
					output: "valor null | erro: No error\nvalor null | erro: Syntax error",
					tags: [
						"php",
						"json",
						"erros-comuns",
						"null",
						"decode",
					],
					callout: {
						type: "hint",
						label: "Solução:",
						text: "prefira `JSON_THROW_ON_ERROR` e `try/catch (JsonException)` para distinguir falha de sintaxe de `null` legítimo.",
					},
				},
			],
		},
	],
};
