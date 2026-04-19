window.DOC_DATA_REGISTRY = window.DOC_DATA_REGISTRY || {};
window.DOC_DATA_REGISTRY["php-arrays"] = {
	"id": "php-arrays",
	"title": "PHP: Manipulação de Arrays",
	"subtitle": "Base prática para manipulação de arrays em PHP no dia a dia.",
	"searchPlaceholder": "Buscar função, comando ou palavra...",
	"shortcutHint": "Atalho: pressione / para focar a busca.",
	"codeLanguage": "php",
	"defaultSectionLayout": "single",
	"sections": [
		{
			"id": "base",
			"name": "Base",
			"layout": "single",
			"entries": [
				{
					"title": "Criar arrays indexados e associativos",
					"kicker": "Estruturas mais comuns",
					"description": "Use array indexado para listas e associativo para pares chave/valor.",
					"descriptionTone": "default",
					"code": "<?php\n$nomes = [\"Ana\", \"Bruno\", \"Carla\"];\n$usuario = [\n    \"nome\" => \"Ana\",\n    \"email\" => \"ana@email.com\",\n    \"ativo\" => true,\n];\n\nprint_r($nomes);\nprint_r($usuario);",
					"tags": [
						"php",
						"array",
						"indexado",
						"associativo",
						"criar",
						"base"
					]
				},
				{
					"title": "Ler e alterar valores",
					"kicker": "Acesso por índice e por chave",
					"description": "Acesse com [] e sobrescreva diretamente quando necessário.",
					"descriptionTone": "default",
					"code": "<?php\n$frutas = [\"maçã\", \"banana\", \"uva\"];\n$frutas[1] = \"laranja\";\n\necho $frutas[0] . PHP_EOL; // maçã\necho $frutas[1] . PHP_EOL; // laranja\n\n$usuario = [\"nome\" => \"Bruno\", \"cargo\" => \"dev\"];\n$usuario[\"cargo\"] = \"tech lead\";\necho $usuario[\"cargo\"] . PHP_EOL;",
					"tags": [
						"php",
						"array",
						"acessar",
						"alterar",
						"indice",
						"chave"
					]
				},
				{
					"title": "Adicionar e remover itens",
					"kicker": "push, pop, shift e unset",
					"description": "Combine funções de pilha/fila e unset para remoções pontuais.",
					"descriptionTone": "default",
					"code": "<?php\n$itens = [\"a\", \"b\", \"c\"];\n\narray_push($itens, \"d\"); // [a,b,c,d]\n$ultimo = array_pop($itens); // remove d\n$primeiro = array_shift($itens); // remove a\n\n$itens[] = \"x\"; // adiciona no fim\nunset($itens[1]); // remove índice específico\n\nprint_r($itens);\necho \"Primeiro removido: $primeiro\" . PHP_EOL;\necho \"Último removido: $ultimo\" . PHP_EOL;",
					"tags": [
						"php",
						"array_push",
						"array_pop",
						"array_shift",
						"unset",
						"remover",
						"adicionar"
					],
					"callout": {
						"type": "warn",
						"label": "Atenção:",
						"text": "depois de `unset`, os índices podem ficar não sequenciais."
					}
				}
			]
		},
		{
			"id": "transformacao",
			"name": "Transformação",
			"layout": "single",
			"entries": [
				{
					"title": "Filtrar itens com array_filter",
					"kicker": "Manter apenas o que interessa",
					"description": "Passe uma função para manter itens que atendem a uma regra.",
					"descriptionTone": "default",
					"code": "<?php\n$numeros = [1, 2, 3, 4, 5, 6];\n$pares = array_filter($numeros, fn($n) => $n % 2 === 0);\n\nprint_r($pares); // 2,4,6",
					"tags": [
						"php",
						"array_filter",
						"filtro",
						"transformacao",
						"pares"
					]
				},
				{
					"title": "Mapear itens com array_map",
					"kicker": "Transformar cada elemento",
					"description": "Ideal para converter estrutura ou formatar saída em massa.",
					"descriptionTone": "default",
					"code": "<?php\n$precos = [10, 25, 39.9];\n$precosFormatados = array_map(\n    fn($valor) => \"R$ \" . number_format($valor, 2, \",\", \".\"),\n    $precos\n);\n\nprint_r($precosFormatados);",
					"tags": [
						"php",
						"array_map",
						"map",
						"transformacao",
						"formatacao"
					]
				},
				{
					"title": "Redução com array_reduce",
					"kicker": "Somar ou agregar valores",
					"description": "Use para consolidar vários itens em um único resultado.",
					"descriptionTone": "default",
					"code": "<?php\n$valores = [12, 8, 15, 5];\n$total = array_reduce($valores, fn($acc, $item) => $acc + $item, 0);\n\necho \"Total: $total\" . PHP_EOL;",
					"tags": [
						"php",
						"array_reduce",
						"reduce",
						"soma",
						"agregacao"
					]
				}
			]
		},
		{
			"id": "busca-validacao",
			"name": "Busca e Validação",
			"layout": "single",
			"entries": [
				{
					"title": "Checar existência de valor",
					"kicker": "in_array para valores",
					"description": "Verifica se determinado valor está presente na lista.",
					"descriptionTone": "default",
					"code": "<?php\n$perfis = [\"admin\", \"editor\", \"viewer\"];\n\nif (in_array(\"editor\", $perfis, true)) {\n    echo \"Perfil encontrado\" . PHP_EOL;\n}",
					"tags": [
						"php",
						"in_array",
						"buscar",
						"valor",
						"validacao"
					]
				},
				{
					"title": "Checar existência de chave",
					"kicker": "array_key_exists para arrays associativos",
					"description": "Valida se a chave existe mesmo que o valor seja null.",
					"descriptionTone": "default",
					"code": "<?php\n$config = [\n    \"host\" => \"localhost\",\n    \"porta\" => null,\n];\n\nvar_dump(array_key_exists(\"porta\", $config)); // true\nvar_dump(isset($config[\"porta\"])); // false",
					"tags": [
						"php",
						"array_key_exists",
						"isset",
						"chave",
						"associativo",
						"validacao"
					],
					"callout": {
						"type": "hint",
						"label": "Dica:",
						"text": "prefira `array_key_exists` quando precisar diferenciar chave ausente de valor `null`."
					}
				},
				{
					"title": "Encontrar índice com array_search",
					"kicker": "Localizar posição de um item",
					"description": "Retorna o índice/chave da primeira ocorrência encontrada.",
					"descriptionTone": "default",
					"code": "<?php\n$stack = [\"cache\", \"queue\", \"db\"];\n$indice = array_search(\"queue\", $stack, true);\n\nif ($indice !== false) {\n    echo \"Encontrado no índice: $indice\" . PHP_EOL;\n}",
					"tags": [
						"php",
						"array_search",
						"indice",
						"buscar",
						"primeira ocorrencia"
					]
				}
			]
		},
		{
			"id": "ordenacao",
			"name": "Ordenação",
			"layout": "single",
			"entries": [
				{
					"title": "Ordenar arrays indexados",
					"kicker": "sort e rsort",
					"description": "Use sort para crescente e rsort para decrescente.",
					"descriptionTone": "default",
					"code": "<?php\n$notas = [8, 6, 10, 7];\n\nsort($notas);  // crescente\nprint_r($notas);\n\nrsort($notas); // decrescente\nprint_r($notas);",
					"tags": [
						"php",
						"sort",
						"rsort",
						"ordenacao",
						"crescente",
						"decrescente"
					]
				},
				{
					"title": "Ordenar arrays associativos",
					"kicker": "asort, arsort, ksort e krsort",
					"description": "Escolha se quer ordenar por valor ou por chave.",
					"descriptionTone": "default",
					"code": "<?php\n$ranking = [\n    \"ana\" => 120,\n    \"bruno\" => 95,\n    \"carla\" => 140,\n];\n\narsort($ranking); // por valor desc\nprint_r($ranking);\n\nksort($ranking); // por chave asc\nprint_r($ranking);",
					"tags": [
						"php",
						"asort",
						"arsort",
						"ksort",
						"krsort",
						"associativo",
						"ordenacao"
					]
				}
			]
		},
		{
			"id": "composicao",
			"name": "Composição",
			"layout": "single",
			"entries": [
				{
					"title": "Mesclar arrays",
					"kicker": "array_merge e operador +",
					"description": "array_merge reindexa numéricos; operador + preserva chaves da esquerda.",
					"descriptionTone": "default",
					"code": "<?php\n$a = [\"php\", \"js\"];\n$b = [\"go\", \"rust\"];\n\nprint_r(array_merge($a, $b));\n\n$c1 = [\"nome\" => \"Ana\", \"cargo\" => \"dev\"];\n$c2 = [\"cargo\" => \"lead\", \"time\" => \"plataforma\"];\n\nprint_r(array_merge($c1, $c2)); // cargo sobrescrito\nprint_r($c1 + $c2); // mantém chave da esquerda",
					"tags": [
						"php",
						"array_merge",
						"merge",
						"operador +",
						"composicao"
					],
					"callout": {
						"type": "danger",
						"label": "Perigo:",
						"text": "em arrays associativos, `array_merge` pode sobrescrever chaves com mesmo nome."
					}
				},
				{
					"title": "Flatten simples de matriz",
					"kicker": "Juntar subarrays em uma lista",
					"description": "Útil para normalizar estruturas antes de map/filter/sort.",
					"descriptionTone": "default",
					"code": "<?php\n$grupos = [\n    [\"ana\", \"bruno\"],\n    [\"carla\"],\n    [\"diego\", \"erika\"],\n];\n\n$nomes = array_merge(...$grupos);\nprint_r($nomes);",
					"tags": [
						"php",
						"flatten",
						"array_merge",
						"multidimensional",
						"normalizacao"
					]
				}
			]
		}
	]
};
