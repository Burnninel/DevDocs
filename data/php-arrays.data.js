window.DOC_DATA_REGISTRY = window.DOC_DATA_REGISTRY || {};
window.DOC_DATA_REGISTRY["php-arrays"] = {
	id: "php-arrays",
	title: "PHP: Manipulando Arrays",
	subtitle:
		"Guia prático e mais completo para criar, transformar, buscar, ordenar e combinar arrays no PHP.",
	searchPlaceholder: "Buscar função, comando ou palavra...",
	shortcutHint: "Atalho: pressione / para focar a busca.",
	codeLanguage: "php",
	defaultSectionLayout: "single",
	sections: [
		{
			id: "base",
			name: "Base",
			layout: "single",
			entries: [
				{
					title: "Criar arrays indexados e associativos",
					kicker: "Entender a estrutura antes de manipular",
					description:
						"Array indexado é melhor para listas; array associativo é melhor para dados nomeados. Saber essa diferença ajuda a escolher a função certa depois.",
					descriptionTone: "default",
					code: '<?php\n$nomes = ["Ana", "Bruno", "Carla"]; // Array indexado\n$usuario = [ // Array associativo\n    "nome" => "Ana",\n    "email" => "ana@email.com",\n    "ativo" => true,\n];\n\necho $nomes[1] . PHP_EOL;\necho $usuario["email"] . PHP_EOL;\n\nprint_r($nomes);\nprint_r($usuario);\n\n/*\nSaída:\nBruno\nana@email.com\nArray\n(\n    [0] => Ana\n    [1] => Bruno\n    [2] => Carla\n)\nArray\n(\n    [nome] => Ana\n    [email] => ana@email.com\n    [ativo] => 1\n)\n*/',
					tags: [
						"php",
						"array",
						"indexado",
						"associativo",
						"criar",
						"base",
					],
				},
				{
					title: "Trabalhar com arrays associativos multidimensionais",
					kicker: "Estruturas aninhadas para dados reais",
					description:
						"Array associativo multidimensional é um array de arrays com chaves nomeadas. Ele é muito usado para representar usuários, pedidos, configurações e respostas de API com vários níveis.",
					descriptionTone: "default",
					code: '<?php\n$empresa = [\n    "nome" => "DevDocs",\n    "endereco" => [\n        "cidade" => "Sao Paulo",\n        "uf" => "SP",\n    ],\n    "times" => [\n        [\n            "nome" => "Plataforma",\n            "lider" => "Ana",\n        ],\n        [\n            "nome" => "Produto",\n            "lider" => "Bruno",\n        ],\n    ],\n];\n\necho $empresa["nome"] . PHP_EOL;\necho $empresa["endereco"]["cidade"] . " - " . $empresa["endereco"]["uf"] . PHP_EOL;\necho $empresa["times"][1]["lider"] . PHP_EOL;\n\n$cep = $empresa["endereco"]["cep"] ?? "não informado"; // Fallback se a chave não existir\necho "CEP: $cep" . PHP_EOL;\n\n$empresa["times"][0]["lider"] = "Carla"; // Atualiza valor aninhado\nprint_r($empresa["times"][0]);\n\n/*\nSaída:\nDevDocs\nSao Paulo - SP\nBruno\nCEP: não informado\nArray\n(\n    [nome] => Plataforma\n    [lider] => Carla\n)\n*/',
					tags: [
						"php",
						"array",
						"associativo",
						"multidimensional",
						"aninhado",
						"base",
					],
					callout: {
						type: "hint",
						label: "Dica:",
						text: "para evitar aviso de índice/chave inexistente em níveis profundos, valide com `isset` ou use coalescência nula (`??`).",
					},
				},
				{
					title: "Ler, alterar e adicionar valores",
					kicker: "Acesso por índice e por chave",
					description:
						"Use colchetes para acessar e sobrescrever valores. Para listas, `$array[] = valor` continua sendo a forma mais direta de adicionar no final.",
					descriptionTone: "default",
					code: '<?php\n$frutas = ["maçã", "banana", "uva"];\n$frutas[1] = "laranja";\n$frutas[] = "melancia";\n\n$usuario = ["nome" => "Bruno", "cargo" => "dev"];\n$usuario["cargo"] = "tech lead";\n$usuario["time"] = "plataforma";\n\necho $frutas[0] . PHP_EOL;\necho $frutas[1] . PHP_EOL;\necho $usuario["cargo"] . PHP_EOL;\n\nprint_r($frutas);\nprint_r($usuario);\n\n/*\nSaída:\nmaçã\nlaranja\ntech lead\nArray\n(\n    [0] => maçã\n    [1] => laranja\n    [2] => uva\n    [3] => melancia\n)\nArray\n(\n    [nome] => Bruno\n    [cargo] => tech lead\n    [time] => plataforma\n)\n*/',
					tags: [
						"php",
						"array",
						"acessar",
						"alterar",
						"adicionar",
						"indice",
						"chave",
					],
				},
				{
					title: "Adicionar e remover itens",
					kicker: "push, pop, shift, unshift e unset",
					description:
						"Essas operações aparecem o tempo todo. Assinaturas úteis: `array_push($array, $valor...)`, `array_unshift($array, $valor...)`, `array_pop($array)` e `array_shift($array)`. Em `unset($array[$indice])`, você remove uma posição específica.",
					descriptionTone: "default",
					code: '<?php\n$itens = ["a", "b", "c"];\n\narray_push($itens, "d"); // Adiciona no fim\narray_unshift($itens, "inicio"); // Adiciona no início\n$ultimo = array_pop($itens); // Remove do fim e retorna\n$primeiro = array_shift($itens); // Remove do início e retorna\nunset($itens[1]); // Remove índice específico\n\nprint_r($itens);\necho "Primeiro removido: $primeiro" . PHP_EOL;\necho "Último removido: $ultimo" . PHP_EOL;\n\n/*\nSaída:\nArray\n(\n    [0] => a\n    [2] => c\n)\nPrimeiro removido: inicio\nÚltimo removido: d\n*/',
					tags: [
						"php",
						"array_push",
						"array_pop",
						"array_shift",
						"array_unshift",
						"unset",
						"remover",
						"adicionar",
					],
					callout: {
						type: "warn",
						label: "Atenção:",
						text: "depois de `unset`, os índices podem ficar não sequenciais. Se precisar reindexar, use `array_values`.",
					},
				},
				{
					title: "Percorrer arrays com foreach",
					kicker: "Leitura simples e legível",
					description:
						"`foreach` é a forma mais comum de iterar arrays no PHP. Em arrays associativos, capture tanto a chave quanto o valor.",
					descriptionTone: "default",
					code: '<?php\n$notas = ["Ana" => 9, "Bruno" => 7, "Carla" => 10];\n\nforeach ($notas as $nome => $nota) {\n    echo "$nome tirou $nota" . PHP_EOL;\n}\n\n/*\nSaída:\nAna tirou 9\nBruno tirou 7\nCarla tirou 10\n*/',
					tags: [
						"php",
						"foreach",
						"iterar",
						"loop",
						"chave",
						"valor",
					],
				},
				{
					title: "Alterar itens com foreach por referência",
					kicker: "Quando você quer modificar o array original",
					description:
						"Use `foreach (&$item)` quando precisar alterar os valores diretamente durante a iteração. Depois do loop, faça `unset($item)` para evitar efeitos colaterais com a referência.",
					descriptionTone: "default",
					code: "<?php\n$precos = [100, 250, 400];\n\nforeach ($precos as &$preco) { // &$preco altera o array original\n    $preco = $preco * 1.1;\n}\nunset($preco); // Quebra a referência\n\nprint_r($precos);\n\n/*\nSaída:\nArray\n(\n    [0] => 110\n    [1] => 275\n    [2] => 440\n)\n*/",
					tags: [
						"php",
						"foreach",
						"referencia",
						"alterar",
						"mutacao",
						"loop",
					],
					callout: {
						type: "warn",
						label: "Atenção:",
						text: "depois de usar `foreach` por referência, faça `unset($item)` para não manter a última posição referenciada por acidente.",
					},
				},
				{
					title: "Contar itens e reindexar array",
					kicker: "count e array_values",
					description:
						"`count($array)` mostra o tamanho do array. `array_values($array)` é útil depois de filtros ou `unset`, quando você precisa voltar para índices sequenciais.",
					descriptionTone: "default",
					code: '<?php\n$ids = [10, 20, 30];\nunset($ids[1]);\n\necho "Quantidade: " . count($ids) . PHP_EOL;\nprint_r($ids);\nprint_r(array_values($ids));\n\n/*\nSaída:\nQuantidade: 2\nArray\n(\n    [0] => 10\n    [2] => 30\n)\nArray\n(\n    [0] => 10\n    [1] => 30\n)\n*/',
					tags: [
						"php",
						"count",
						"array_values",
						"reindexar",
						"quantidade",
						"base",
					],
				},
			],
		},
		{
			id: "transformacao",
			name: "Transformação",
			layout: "single",
			entries: [
				{
					title: "Filtrar itens com array_filter",
					kicker: "Manter apenas o que interessa",
					description:
						"Use `array_filter($array, $callback)` quando quiser reduzir uma lista com base em regra. O primeiro parâmetro é a lista e o segundo é a função de filtro; ele preserva as chaves originais.",
					descriptionTone: "default",
					code: "<?php\n$numeros = [1, 2, 3, 4, 5, 6];\n$pares = array_filter($numeros, fn($n) => $n % 2 === 0); // Mantém apenas pares\n\nprint_r($pares);\nprint_r(array_values($pares)); // Reindexa o resultado\n\n/*\nSaída:\nArray\n(\n    [1] => 2\n    [3] => 4\n    [5] => 6\n)\nArray\n(\n    [0] => 2\n    [1] => 4\n    [2] => 6\n)\n*/",
					tags: [
						"php",
						"array_filter",
						"filtro",
						"transformacao",
						"pares",
						"reindexar",
					],
				},
				{
					title: "Mapear itens com array_map",
					kicker: "Transformar cada elemento sem alterar o original",
					description:
						"`array_map($callback, $array)` cria um novo array a partir de cada item original. Aqui a ordem muda: a função vem primeiro e o array depois.",
					descriptionTone: "default",
					code: '<?php\n$precos = [10, 25, 39.9];\n$precosFormatados = array_map(\n    fn($valor) => "R$ " . number_format($valor, 2, ",", "."),\n    $precos\n);\n\nprint_r($precosFormatados);\n\n/*\nSaída:\nArray\n(\n    [0] => R$ 10,00\n    [1] => R$ 25,00\n    [2] => R$ 39,90\n)\n*/',
					tags: [
						"php",
						"array_map",
						"map",
						"transformacao",
						"formatacao",
					],
				},
				{
					title: "Reduzir valores com array_reduce",
					kicker: "Consolidar vários itens em um único resultado",
					description:
						"`array_reduce($array, $callback, $valorInicial)` serve para somar, agrupar, acumular ou montar estruturas derivadas. Primeiro vem a lista, depois a regra e por fim o valor inicial.",
					descriptionTone: "default",
					code: '<?php\n$pedidos = [\n    ["produto" => "Mouse", "valor" => 120],\n    ["produto" => "Teclado", "valor" => 250],\n    ["produto" => "Headset", "valor" => 180],\n];\n\n$total = array_reduce(\n    $pedidos,\n    fn($acc, $pedido) => $acc + $pedido["valor"],\n    0\n);\n\necho "Total: R$ $total" . PHP_EOL;\n\n/*\nSaída:\nTotal: R$ 550\n*/',
					tags: [
						"php",
						"array_reduce",
						"reduce",
						"soma",
						"agregacao",
						"total",
					],
				},
				{
					title: "Extrair uma coluna com array_column",
					kicker: "Muito útil com listas de arrays associativos",
					description:
						"Quando você tem uma lista de registros, `array_column($registros, $coluna, $indiceOpcional)` evita loops manuais para pegar só uma propriedade. O terceiro parâmetro é opcional e define a chave do resultado.",
					descriptionTone: "default",
					code: '<?php\n$usuarios = [\n    ["id" => 1, "nome" => "Ana", "email" => "ana@email.com"],\n    ["id" => 2, "nome" => "Bruno", "email" => "bruno@email.com"],\n    ["id" => 3, "nome" => "Carla", "email" => "carla@email.com"],\n];\n\n$nomes = array_column($usuarios, "nome"); // Extrai uma coluna\n$emailsPorId = array_column($usuarios, "email", "id"); // Usa id como índice\n\nprint_r($nomes);\nprint_r($emailsPorId);\n\n/*\nSaída:\nArray\n(\n    [0] => Ana\n    [1] => Bruno\n    [2] => Carla\n)\nArray\n(\n    [1] => ana@email.com\n    [2] => bruno@email.com\n    [3] => carla@email.com\n)\n*/',
					tags: [
						"php",
						"array_column",
						"extrair",
						"coluna",
						"usuarios",
						"transformacao",
					],
				},
			],
		},
		{
			id: "busca-validacao",
			name: "Busca e Validação",
			layout: "single",
			entries: [
				{
					title: "Checar existência de valor com in_array",
					kicker: "Verificação rápida em listas",
					description:
						"`in_array($valor, $array, $estrito)` recebe primeiro o valor procurado e depois a lista. Use o terceiro parâmetro como `true` para comparação estrita e evitar bugs de tipo.",
					descriptionTone: "default",
					code: '<?php\n$perfis = ["admin", "editor", "viewer"];\n\nvar_dump(in_array("editor", $perfis, true)); // true: encontrou valor\nvar_dump(in_array(1, ["1", "2", "3"], true)); // false: tipos diferentes\nvar_dump(in_array(1, ["1", "2", "3"], false)); // true: comparação frouxa\n\n/*\nSaída:\nbool(true)\nbool(false)\nbool(true)\n*/',
					tags: [
						"php",
						"in_array",
						"buscar",
						"valor",
						"validacao",
						"estrito",
					],
				},
				{
					title: "Checar existência de chave",
					kicker: "array_key_exists vs isset",
					description:
						"`array_key_exists($chave, $array)` responde se a chave existe. Já `isset($array[$chave])` só retorna `true` quando a chave existe e o valor não é `null`.",
					descriptionTone: "default",
					code: '<?php\n$config = [\n    "host" => "localhost",\n    "porta" => null,\n];\n\nvar_dump(array_key_exists("porta", $config)); // true: chave existe\nvar_dump(isset($config["porta"])); // false: valor é null\n\n/*\nSaída:\nbool(true)\nbool(false)\n*/',
					tags: [
						"php",
						"array_key_exists",
						"isset",
						"chave",
						"associativo",
						"validacao",
					],
					callout: {
						type: "hint",
						label: "Dica:",
						text: "prefira `array_key_exists` quando precisar diferenciar chave ausente de valor `null`.",
					},
				},
				{
					title: "Encontrar índice com array_search",
					kicker: "Recuperar a posição da primeira ocorrência",
					description:
						"`array_search($valor, $array, $estrito)` retorna a chave ou índice encontrado. Sempre compare com `!== false`, porque índice `0` é um resultado válido.",
					descriptionTone: "default",
					code: '<?php\n$stack = ["cache", "queue", "db"];\n$indice = array_search("cache", $stack, true); // Busca estrita\n\nif ($indice !== false) { // 0 também é resultado válido\n    echo "Encontrado no índice: $indice" . PHP_EOL;\n}\n\n/*\nSaída:\nEncontrado no índice: 0\n*/',
					tags: [
						"php",
						"array_search",
						"indice",
						"buscar",
						"primeira ocorrencia",
						"false",
					],
					callout: {
						type: "warn",
						label: "Atenção:",
						text: "não use `if ($indice)` para validar o retorno, porque o índice `0` será tratado como falso.",
					},
				},
			],
		},
		{
			id: "ordenacao",
			name: "Ordenação",
			layout: "single",
			entries: [
				{
					title: "Ordenar arrays indexados",
					kicker: "sort e rsort reindexam o array",
					description:
						"`sort($array)` ordena em ordem crescente e `rsort($array)` em ordem decrescente. Ambas recebem o array por referência e reorganizam os índices.",
					descriptionTone: "default",
					code: "<?php\n$notas = [8, 6, 10, 7];\n\nsort($notas);\nprint_r($notas);\n\nrsort($notas);\nprint_r($notas);\n\n/*\nSaída:\nArray\n(\n    [0] => 6\n    [1] => 7\n    [2] => 8\n    [3] => 10\n)\nArray\n(\n    [0] => 10\n    [1] => 8\n    [2] => 7\n    [3] => 6\n)\n*/",
					tags: [
						"php",
						"sort",
						"rsort",
						"ordenacao",
						"crescente",
						"decrescente",
					],
				},
				{
					title: "Ordenar arrays associativos",
					kicker: "asort, arsort, ksort e krsort",
					description:
						"Em arrays associativos, escolha se quer ordenar por valor (`asort`, `arsort`) ou por chave (`ksort`, `krsort`). Todas usam assinatura `funcao($array)` e preservam a associação chave/valor.",
					descriptionTone: "default",
					code: '<?php\n$ranking = [\n    "ana" => 120,\n    "bruno" => 95,\n    "carla" => 140,\n];\n\narsort($ranking);\nprint_r($ranking);\n\nksort($ranking);\nprint_r($ranking);\n\n/*\nSaída:\nArray\n(\n    [carla] => 140\n    [ana] => 120\n    [bruno] => 95\n)\nArray\n(\n    [ana] => 120\n    [bruno] => 95\n    [carla] => 140\n)\n*/',
					tags: [
						"php",
						"asort",
						"arsort",
						"ksort",
						"krsort",
						"associativo",
						"ordenacao",
					],
				},
				{
					title: "Ordenar com regra personalizada usando usort",
					kicker: "Quando sort e asort não bastam",
					description:
						"`usort($array, $comparador)` permite definir sua regra de ordenação. O comparador deve retornar negativo, zero ou positivo para indicar a ordem.",
					descriptionTone: "default",
					code: '<?php\n$produtos = [\n    ["nome" => "Monitor", "preco" => 899],\n    ["nome" => "Mouse", "preco" => 120],\n    ["nome" => "Teclado", "preco" => 250],\n];\n\nusort($produtos, fn($a, $b) => $a["preco"] <=> $b["preco"]);\n\nprint_r($produtos);\n\n/*\nSaída:\nArray\n(\n    [0] => Array\n        (\n            [nome] => Mouse\n            [preco] => 120\n        )\n    [1] => Array\n        (\n            [nome] => Teclado\n            [preco] => 250\n        )\n    [2] => Array\n        (\n            [nome] => Monitor\n            [preco] => 899\n        )\n)\n*/',
					tags: [
						"php",
						"usort",
						"ordenacao",
						"customizada",
						"comparacao",
						"preco",
					],
				},
				{
					title: "Ordenar preservando chaves com uasort",
					kicker: "Regra customizada sem perder a associação",
					description:
						"`uasort($array, $comparador)` segue a mesma ideia do `usort`, mas preserva as chaves originais enquanto aplica sua função de comparação.",
					descriptionTone: "default",
					code: '<?php\n$ranking = [\n    "ana" => ["pontos" => 120],\n    "bruno" => ["pontos" => 95],\n    "carla" => ["pontos" => 140],\n];\n\nuasort($ranking, fn($a, $b) => $b["pontos"] <=> $a["pontos"]);\n\nprint_r($ranking);\n\n/*\nSaída:\nArray\n(\n    [carla] => Array\n        (\n            [pontos] => 140\n        )\n    [ana] => Array\n        (\n            [pontos] => 120\n        )\n    [bruno] => Array\n        (\n            [pontos] => 95\n        )\n)\n*/',
					tags: [
						"php",
						"uasort",
						"ordenacao",
						"associativo",
						"chaves",
						"customizada",
					],
				},
			],
		},
		{
			id: "composicao",
			name: "Composição",
			layout: "single",
			entries: [
				{
					title: "Mesclar arrays",
					kicker: "array_merge e operador + têm comportamentos diferentes",
					description:
						"`array_merge($a, $b, ...)` junta os arrays da esquerda para a direita e, em chaves repetidas, os valores mais à direita vencem. Já o operador `+` preserva os valores da esquerda quando há conflito.",
					descriptionTone: "default",
					code: '<?php\n$a = ["php", "js"];\n$b = ["go", "rust"];\n\nprint_r(array_merge($a, $b)); // Concatena listas\n\n$c1 = ["nome" => "Ana", "cargo" => "dev"];\n$c2 = ["cargo" => "lead", "time" => "plataforma"];\n\nprint_r(array_merge($c1, $c2)); // Em conflito, vence o da direita\nprint_r($c1 + $c2); // Em conflito, preserva o da esquerda\n\n/*\nSaída:\nArray\n(\n    [0] => php\n    [1] => js\n    [2] => go\n    [3] => rust\n)\nArray\n(\n    [nome] => Ana\n    [cargo] => lead\n    [time] => plataforma\n)\nArray\n(\n    [nome] => Ana\n    [cargo] => dev\n    [time] => plataforma\n)\n*/',
					tags: [
						"php",
						"array_merge",
						"merge",
						"operador +",
						"composicao",
					],
					callout: {
						type: "danger",
						label: "Perigo:",
						text: "em arrays associativos, `array_merge` pode sobrescrever chaves com mesmo nome.",
					},
				},
				{
					title: "Mesclar com array_replace e array_replace_recursive",
					kicker: "Substituição simples vs profunda",
					description:
						"`array_replace($base, $override)` substitui no primeiro nível, usando o segundo array para sobrescrever o primeiro. `array_replace_recursive($base, $override)` faz isso também nos níveis internos.",
					descriptionTone: "default",
					code: '<?php\n$configPadrao = [\n    "db" => [\n        "host" => "localhost",\n        "porta" => 3306,\n        "flags" => ["persistente" => false],\n    ],\n    "cache" => true,\n];\n\n$configEnv = [\n    "db" => [\n        "porta" => 5432,\n        "flags" => ["persistente" => true],\n    ],\n    "cache" => false,\n];\n\n$simples = array_replace($configPadrao, $configEnv); // Troca só no 1º nível\n$profundo = array_replace_recursive($configPadrao, $configEnv); // Troca também níveis internos\n\nprint_r($simples["db"]);\nprint_r($profundo["db"]);\n\n/*\nSaída:\nArray\n(\n    [porta] => 5432\n    [flags] => Array\n        (\n            [persistente] => 1\n        )\n)\nArray\n(\n    [host] => localhost\n    [porta] => 5432\n    [flags] => Array\n        (\n            [persistente] => 1\n        )\n)\n*/',
					tags: [
						"php",
						"array_replace",
						"array_replace_recursive",
						"merge",
						"substituicao",
						"composicao",
					],
					callout: {
						type: "hint",
						label: "Dica:",
						text: "quando quiser preservar campos internos existentes, prefira `array_replace_recursive`.",
					},
				},
				{
					title: "Flatten simples de matriz",
					kicker: "Juntar subarrays em uma única lista",
					description:
						"Quando você tem uma matriz simples, o spread em `array_merge(...$grupos)` expande cada subarray como parâmetro da função. É uma saída boa antes de filtrar, ordenar ou mapear.",
					descriptionTone: "default",
					code: '<?php\n$grupos = [\n    ["ana", "bruno"],\n    ["carla"],\n    ["diego", "erika"],\n];\n\n$nomes = array_merge(...$grupos);\nprint_r($nomes);\n\n/*\nSaída:\nArray\n(\n    [0] => ana\n    [1] => bruno\n    [2] => carla\n    [3] => diego\n    [4] => erika\n)\n*/',
					tags: [
						"php",
						"flatten",
						"array_merge",
						"multidimensional",
						"normalizacao",
					],
				},
				{
					title: "Quebrar e juntar strings com explode e implode",
					kicker: "Arrays aparecem muito na fronteira com texto",
					description:
						"`explode($separador, $texto)` quebra uma string em array. `implode($separador, $array)` faz o caminho inverso, então a ordem dos parâmetros muda entre as duas.",
					descriptionTone: "default",
					code: '<?php\n$csv = "php,js,go,rust";\n$tecnologias = explode(",", $csv); // String -> array\n\nprint_r($tecnologias);\necho implode(" | ", $tecnologias) . PHP_EOL; // Array -> string\n\n/*\nSaída:\nArray\n(\n    [0] => php\n    [1] => js\n    [2] => go\n    [3] => rust\n)\nphp | js | go | rust\n*/',
					tags: [
						"php",
						"explode",
						"implode",
						"strings",
						"array",
						"composicao",
					],
				},
				{
					title: "Comparar listas com array_diff e array_intersect",
					kicker: "Descobrir o que entrou, saiu ou coincide",
					description:
						"`array_diff($a, $b)` mostra o que existe em `$a` e não em `$b`. `array_intersect($a, $b)` mostra apenas os valores em comum entre eles.",
					descriptionTone: "default",
					code: '<?php\n$permissoesAtuais = ["ler", "editar", "publicar"];\n$permissoesNovas = ["ler", "editar", "excluir"];\n\n$removidas = array_diff($permissoesAtuais, $permissoesNovas); // Existe em atuais e não em novas\n$mantidas = array_intersect($permissoesAtuais, $permissoesNovas); // Existe nas duas listas\n\nprint_r($removidas);\nprint_r($mantidas);\n\n/*\nSaída:\nArray\n(\n    [2] => publicar\n)\nArray\n(\n    [0] => ler\n    [1] => editar\n)\n*/',
					tags: [
						"php",
						"array_diff",
						"array_intersect",
						"comparar",
						"listas",
						"composicao",
					],
				},
			],
		},
		{
			id: "utilidades-praticas",
			name: "Utilidades Práticas",
			layout: "single",
			entries: [
				{
					title: "Pegar só as chaves ou só os valores",
					kicker: "array_keys e array_values",
					description:
						"`array_keys($array)` retorna apenas as chaves e `array_values($array)` retorna apenas os valores. Ambas são úteis para depuração, validação e comparações rápidas.",
					descriptionTone: "default",
					code: '<?php\n$config = [\n    "host" => "localhost",\n    "porta" => 3306,\n    "database" => "app",\n];\n\nprint_r(array_keys($config)); // Só chaves\nprint_r(array_values($config)); // Só valores\n\n/*\nSaída:\nArray\n(\n    [0] => host\n    [1] => porta\n    [2] => database\n)\nArray\n(\n    [0] => localhost\n    [1] => 3306\n    [2] => app\n)\n*/',
					tags: [
						"php",
						"array_keys",
						"array_values",
						"chaves",
						"valores",
						"utilidades",
					],
				},
				{
					title: "Comparar arrays por chave",
					kicker: "array_diff_key e array_intersect_key",
					description:
						"Quando o que importa são as chaves (e não os valores), use `array_diff_key($a, $b)` para achar chaves exclusivas de `$a` e `array_intersect_key($a, $b)` para achar chaves em comum.",
					descriptionTone: "default",
					code: '<?php\n$payloadA = [\n    "id" => 10,\n    "nome" => "Ana",\n    "email" => "ana@email.com",\n    "ativo" => true,\n];\n\n$payloadB = [\n    "id" => 99,\n    "nome" => "Bruno",\n    "time" => "plataforma",\n    "ativo" => false,\n];\n\n$somenteEmA = array_diff_key($payloadA, $payloadB); // Chaves exclusivas de A\n$chavesEmComum = array_intersect_key($payloadA, $payloadB); // Chaves presentes em ambos\n\nprint_r(array_keys($somenteEmA));\nprint_r(array_keys($chavesEmComum));\n\n/*\nSaída:\nArray\n(\n    [0] => email\n)\nArray\n(\n    [0] => id\n    [1] => nome\n    [2] => ativo\n)\n*/',
					tags: [
						"php",
						"array_diff_key",
						"array_intersect_key",
						"chaves",
						"comparacao",
						"utilidades",
					],
				},
				{
					title: "Remover duplicados com array_unique",
					kicker: "Limpeza simples de listas",
					description:
						"`array_unique($array)` remove duplicados mantendo a primeira ocorrência. Se precisar de índices sequenciais no resultado, aplique `array_values($array)` depois.",
					descriptionTone: "default",
					code: '<?php\n$tags = ["php", "js", "php", "go", "js"];\n$tagsUnicas = array_values(array_unique($tags)); // Remove duplicados e reindexa\n\nprint_r($tagsUnicas);\n\n/*\nSaída:\nArray\n(\n    [0] => php\n    [1] => js\n    [2] => go\n)\n*/',
					tags: [
						"php",
						"array_unique",
						"duplicados",
						"limpeza",
						"tags",
						"utilidades",
					],
				},
				{
					title: "Dividir lista em pedaços com array_chunk",
					kicker: "Lotes, grids e processamento em blocos",
					description:
						"`array_chunk($array, $tamanho)` divide a lista em blocos. O primeiro parâmetro é a lista completa e o segundo é o tamanho de cada lote.",
					descriptionTone: "default",
					code: '<?php\n$usuarios = ["Ana", "Bruno", "Carla", "Diego", "Erika"];\n$lotes = array_chunk($usuarios, 2); // Divide em blocos de 2\n\nprint_r($lotes);\n\n/*\nSaída:\nArray\n(\n    [0] => Array\n        (\n            [0] => Ana\n            [1] => Bruno\n        )\n    [1] => Array\n        (\n            [0] => Carla\n            [1] => Diego\n        )\n    [2] => Array\n        (\n            [0] => Erika\n        )\n)\n*/',
					tags: [
						"php",
						"array_chunk",
						"lotes",
						"dividir",
						"listas",
						"utilidades",
					],
				},
			],
		},
		{
			id: "decisao-rapida",
			name: "Decisão Rápida",
			layout: "single",
			entries: [
				{
					title: "Quando usar cada grupo de funções",
					kicker: "Atalho mental para escolher mais rápido",
					description:
						"Use esta leitura rápida como mapa: `array_map` para transformar, `array_filter` para filtrar, `array_reduce` para acumular, `array_column` para extrair uma coluna, `array_merge` ou `array_replace` para juntar/substituir, `array_diff`/`array_intersect` para comparar valores, `array_diff_key`/`array_intersect_key` para comparar chaves, `sort`/`asort`/`usort`/`uasort` para ordenar e `array_values` para reindexar.",
					descriptionTone: "default",
					code: '<?php\n// Transformar cada item\narray_map(fn($item) => ..., $lista);\n\n// Filtrar por condição\narray_filter($lista, fn($item) => ...);\n\n// Acumular em um valor final\narray_reduce($lista, fn($acc, $item) => ..., $valorInicial);\n\n// Extrair uma coluna de uma lista de registros\narray_column($registros, "campo");\n\n// Juntar ou substituir estruturas\narray_merge($a, $b);\narray_replace($base, $override);\n\n// Comparar listas por valor\narray_diff($a, $b);\narray_intersect($a, $b);\n\n// Comparar listas por chave\narray_diff_key($a, $b);\narray_intersect_key($a, $b);\n\n// Acesso seguro em nível profundo\n$cidade = $usuario["endereco"]["cidade"] ?? "não informado";\n\n// Reindexar após filtro ou unset\narray_values($lista);',
					tags: [
						"php",
						"guia",
						"decisao",
						"map",
						"filter",
						"reduce",
						"ordenacao",
						"comparacao",
					],
					callout: {
						type: "hint",
						label: "Dica:",
						text: "se estiver em dúvida, primeiro pense no objetivo: transformar, filtrar, acumular, comparar, ordenar ou reindexar. A função costuma vir naturalmente depois disso.",
					},
				},
			],
		},
	],
};
