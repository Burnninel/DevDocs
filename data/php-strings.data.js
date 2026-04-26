window.DOC_DATA_REGISTRY = window.DOC_DATA_REGISTRY || {};
window.DOC_DATA_REGISTRY["php-strings"] = {
	id: "php-strings",
	title: "PHP: Manipulação de Strings",
	subtitle:
		"Guia prático para validar, transformar e preparar textos no dia a dia com PHP, com foco em formulários e APIs.",
	searchPlaceholder: "Buscar função, string ou palavra...",
	shortcutHint: "Atalho: pressione / para focar a busca.",
	codeLanguage: "php",
	defaultSectionLayout: "single",
	quickStart: {
		title: "Como testar os exemplos desta documentação",
		kicker: "Requisitos e execução no terminal",
		description:
			"Todos os exemplos rodam com PHP CLI. Para aprender de verdade, teste cada bloco isoladamente e observe a saída.",
		steps: [
			"Verifique se o PHP está disponível com `php --version`.",
			"Crie um arquivo, por exemplo `strings.php`.",
			"Cole um exemplo desta página no arquivo.",
			"Execute no terminal com `php strings.php`.",
		],
		codeLanguage: "shell",
		code: "php --version\nphp strings.php",
		callout: {
			type: "hint",
			label: "Dica:",
			text: "em manipulação de strings, pequenos detalhes de espaço, maiúscula e acento mudam o resultado final.",
		},
	},
	sections: [
		{
			id: "o-que-sao-strings",
			name: "O que são Strings em PHP",
			layout: "single",
			entries: [
				{
					title: "String é texto tratado como dado",
					kicker: "Base para validação, formatação e integração",
					description:
						"String é qualquer sequência de caracteres: nome, email, URL, token, JSON e mensagem de erro. Use manipulação de strings quando dados entram por formulário, API ou banco e precisam de validação e padronização. Isso é importante porque texto sem tratamento costuma quebrar busca, comparação e regras de negócio.",
					descriptionTone: "default",
					code: '<?php\n$nome = "Ana";\n$email = "ana@email.com";\n$token = "abc123XYZ";\n\n$payloadApi = "{\\"ok\\":true,\\"mensagem\\":\\"sucesso\\"}"; // JSON também chega como string\n\necho "Nome: {$nome}" . PHP_EOL;\necho "Email: {$email}" . PHP_EOL;\necho "Token: {$token}" . PHP_EOL;\necho "Payload bruto: {$payloadApi}" . PHP_EOL;',
					output: "Nome: Ana\nEmail: ana@email.com\nToken: abc123XYZ\nPayload bruto: {\"ok\":true,\"mensagem\":\"sucesso\"}",
					tags: [
						"php",
						"strings",
						"conceito",
						"texto",
						"api",
						"formulario",
					],
				},
			],
		},
		{
			id: "formas-criar-strings",
			name: "Formas de criar Strings (aspas simples e duplas)",
			layout: "single",
			entries: [
				{
					title: "Diferença entre aspas simples e duplas",
					kicker: "Entender interpolação evita bugs de saída",
					description:
						"Aspas simples (`''`) tratam quase tudo como literal. Aspas duplas (`\"\"`) interpretam variáveis e caracteres de escape como `\\n`. Use aspas simples para texto fixo e aspas duplas quando precisar interpolar variável. Isso evita saída errada e concatenação desnecessária.",
					descriptionTone: "default",
					code: '<?php\n$nome = "Bruno";\n\necho \'Olá, $nome\' . PHP_EOL; // Aspa simples: variável não é interpolada\necho "Olá, $nome" . PHP_EOL; // Aspa dupla: variável é interpolada\n\necho "Linha 1\\nLinha 2" . PHP_EOL; // Aspa dupla interpreta \\n\n// echo \'Linha 1\\nLinha 2\' . PHP_EOL; // Aspa simples manteria \\n literal',
					output: "Olá, $nome\nOlá, Bruno\nLinha 1\nLinha 2",
					tags: [
						"php",
						"strings",
						"aspas",
						"interpolacao",
						"simples",
						"duplas",
					],
				},
				{
					title: "Interpolação com chaves para evitar ambiguidade",
					kicker: "Útil quando variável encosta em texto",
					description:
						"Quando a variável fica junto de letras, use `{}` para delimitar claramente o nome. Isso melhora legibilidade e evita interpretação errada do parser.",
					descriptionTone: "default",
					code: '<?php\n$usuario = "ana";\n\necho "User: {$usuario}_admin" . PHP_EOL; // Chaves definem o limite da variável\n\necho "URL: /perfil/{$usuario}" . PHP_EOL; // Interpolação segura em rotas',
					output: "User: ana_admin\nURL: /perfil/ana",
					tags: [
						"php",
						"strings",
						"interpolacao",
						"chaves",
						"template",
						"saida",
					],
				},
			],
		},
		{
			id: "concatenacao-strings",
			name: "Concatenação de Strings",
			layout: "single",
			entries: [
				{
					title: "Concatenação com ponto (.) e ponto igual (.=)",
					kicker: "Montar mensagens e payloads de forma incremental",
					description:
						"No PHP, concatenação de strings é feita com `.`. Use `.=` quando quiser adicionar partes no mesmo buffer de texto. Isso é útil em logs, mensagens de validação e montagem de respostas.",
					descriptionTone: "default",
					code: '<?php\n$nome = "Ana";\n$cargo = "Desenvolvedora";\n\n$frase = "Usuária: " . $nome . " | Cargo: " . $cargo; // Concatena blocos de texto\n\necho $frase . PHP_EOL;\n\n$log = "Início";\n$log .= " -> validação"; // Adiciona trecho no mesmo texto\n$log .= " -> envio API";\n\necho $log . PHP_EOL;',
					output: "Usuária: Ana | Cargo: Desenvolvedora\nInício -> validação -> envio API",
					tags: [
						"php",
						"strings",
						"concatenacao",
						"operador-ponto",
						"montagem",
						"log",
					],
				},
			],
		},
		{
			id: "principais-funcoes-strings",
			name: "Principais funções de manipulação de Strings",
			layout: "single",
			entries: [
				{
					title: "strlen(): tamanho do texto",
					kicker: "Validar limites de campos antes de salvar",
					description:
						"`strlen($texto)` recebe a string em `$texto` e retorna seu tamanho. Use para validar limite mínimo e máximo em formulário e payloads API. Isso evita gravar dados incompletos ou acima da regra.",
					descriptionTone: "default",
					code: '<?php\n$senha = "abc123";\n\necho "Tamanho simples: " . strlen($senha) . PHP_EOL; // Exemplo simples\n\n$nomeUsuario = "ana_silva";\nif (strlen($nomeUsuario) < 5) {\n    echo "Nome de usuário muito curto" . PHP_EOL;\n} else {\n    echo "Nome de usuário válido" . PHP_EOL; // Exemplo prático de validação\n}',
					output: "Tamanho simples: 6\nNome de usuário válido",
					tags: [
						"php",
						"strings",
						"strlen",
						"validacao",
						"tamanho",
						"formulario",
					],
				},
				{
					title: "substr(): extrair parte do texto",
					kicker: "Criar prévias e separar blocos de informação",
					description:
						"`substr($texto, $inicio, $tamanho)` recorta parte da string: `$texto` é a origem, `$inicio` é a posição inicial e `$tamanho` define quantos caracteres retornar. Use para preview de descrição, últimos dígitos de documento e extração de blocos fixos.",
					descriptionTone: "default",
					code: '<?php\n$codigo = "PED-2026-000981";\n\necho "Trecho simples: " . substr($codigo, 4, 4) . PHP_EOL; // Exemplo simples: 2026\n\n$descricao = "Notebook gamer com 16GB RAM e SSD de 1TB";\n$preview = substr($descricao, 0, 20) . "..."; // Exemplo prático: teaser para listagem\n\necho "Preview: " . $preview . PHP_EOL;',
					output: "Trecho simples: 2026\nPreview: Notebook gamer com 1...",
					tags: [
						"php",
						"strings",
						"substr",
						"extracao",
						"preview",
						"formatacao",
					],
				},
				{
					title: "str_replace(): substituir trechos específicos",
					kicker: "Normalizar dados antes de processar",
					description:
						"`str_replace($buscar, $substituir, $texto)` troca conteúdo no texto: `$buscar` é o trecho original, `$substituir` é o novo valor e `$texto` é onde a troca acontece. Use para limpar máscara de CPF/telefone, ajustar formato e padronizar entrada de formulário/API.",
					descriptionTone: "default",
					code: '<?php\n$frase = "Olá mundo";\necho str_replace("mundo", "time", $frase) . PHP_EOL; // Exemplo simples\n\n$telefone = "(11) 99999-8888";\n$telefoneLimpo = str_replace(["(", ")", " ", "-"], "", $telefone); // Exemplo prático de limpeza\n\necho "Telefone limpo: " . $telefoneLimpo . PHP_EOL;',
					output: "Olá time\nTelefone limpo: 11999998888",
					tags: [
						"php",
						"strings",
						"str_replace",
						"normalizacao",
						"telefone",
						"formulario",
					],
				},
				{
					title: "strtolower() e strtoupper(): padronizar caixa",
					kicker: "Comparar e armazenar dados com consistência",
					description:
						"`strtolower($texto)` recebe a string e devolve em minúsculo; `strtoupper($texto)` faz o mesmo para maiúsculo. Use para comparação sem erro de caixa e para padronizar email, código e status.",
					descriptionTone: "default",
					code: '<?php\n$status = "Aprovado";\n\necho strtolower($status) . PHP_EOL; // Exemplo simples\necho strtoupper($status) . PHP_EOL; // Exemplo simples\n\n$emailForm = "ANA.SILVA@EMAIL.COM";\n$emailNormalizado = strtolower($emailForm); // Exemplo prático para login e busca\n\necho "Email normalizado: " . $emailNormalizado . PHP_EOL;',
					output: "aprovado\nAPROVADO\nEmail normalizado: ana.silva@email.com",
					tags: [
						"php",
						"strings",
						"strtolower",
						"strtoupper",
						"normalizacao",
						"email",
					],
				},
				{
					title: "trim(): remover espaços extras nas bordas",
					kicker: "Primeiro passo em quase toda validação textual",
					description:
						"`trim($texto, $caracteresOpcional)` remove espaços nas bordas de `$texto`; o segundo parâmetro é opcional e define quais caracteres remover. Use antes de validar campo obrigatório, comparar textos e salvar dados para evitar falso vazio e ruído invisível.",
					descriptionTone: "default",
					code: '<?php\n$nome = "   Carla   ";\necho "[" . trim($nome) . "]" . PHP_EOL; // Exemplo simples\n\n$comentario = "   "; // Usuário enviou só espaços\nif (trim($comentario) === "") {\n    echo "Comentário obrigatório" . PHP_EOL; // Exemplo prático de validação\n}',
					output: "[Carla]\nComentário obrigatório",
					tags: [
						"php",
						"strings",
						"trim",
						"validacao",
						"espacos",
						"formulario",
					],
				},
			],
		},
		{
			id: "busca-verificacao-strings",
			name: "Busca e verificação em Strings",
			layout: "single",
			entries: [
				{
					title: "strpos(): encontrar posição de um trecho",
					kicker: "Busca direta para validação de conteúdo",
					description:
						"`strpos($texto, $trecho, $offsetOpcional)` procura `$trecho` dentro de `$texto` e retorna a posição inicial; se não achar, retorna `false`. O terceiro parâmetro é opcional para começar a busca de outro ponto. Compare sempre com `!== false` para não confundir posição `0` com falso.",
					descriptionTone: "default",
					code: '<?php\n$email = "ana@email.com";\n$posicaoArroba = strpos($email, "@");\n\necho "Posição de @: " . $posicaoArroba . PHP_EOL; // Exemplo simples\n\n$mensagemApi = "erro: token expirado";\nif (strpos($mensagemApi, "erro:") !== false) { // Validação prática de prefixo\n    echo "Resposta de erro identificada" . PHP_EOL;\n}',
					output: "Posição de @: 3\nResposta de erro identificada",
					tags: [
						"php",
						"strings",
						"strpos",
						"busca",
						"validacao",
						"api",
					],
				},
				{
					title: "Comparação de strings com segurança",
					kicker: "Evitar falso positivo por caixa ou tipo",
					description:
						"Use `===` para comparação estrita. Em comparação textual, `strcmp($a, $b)` compara duas strings com diferença de caixa e `strcasecmp($a, $b)` ignora caixa. `$a` e `$b` são os dois textos comparados. Isso é útil em regra de permissão, status e integrações.",
					descriptionTone: "default",
					code: '<?php\n$perfilEntrada = "Admin";\n\nvar_dump($perfilEntrada === "Admin"); // Comparação estrita exata\nvar_dump(strcmp($perfilEntrada, "admin")); // Sensível a caixa\nvar_dump(strcasecmp($perfilEntrada, "admin")); // Ignora caixa\n\nif (strcasecmp($perfilEntrada, "admin") === 0) {\n    echo "Perfil autorizado" . PHP_EOL; // Exemplo prático em autorização\n}',
					output: "bool(true)\nint(-32)\nint(0)\nPerfil autorizado",
					tags: [
						"php",
						"strings",
						"comparacao",
						"strcmp",
						"strcasecmp",
						"validacao",
					],
				},
				{
					title: "Validação básica: verificar se contém texto útil",
					kicker: "Diferenciar vazio real de conteúdo válido",
					description:
						"Em formulário e API, o campo pode chegar com espaço, quebra de linha ou texto parcial. Combine `trim()` e busca para validar intenção real do usuário.",
					descriptionTone: "default",
					code: '<?php\n$bio = "   Desenvolvedor PHP e APIs   ";\n\n$bioLimpa = trim($bio); // Remove ruído nas bordas\nif ($bioLimpa === "") {\n    echo "Bio obrigatória" . PHP_EOL;\n} elseif (strpos(strtolower($bioLimpa), "php") !== false) {\n    echo "Bio contém tecnologia-chave: PHP" . PHP_EOL; // Validação de conteúdo\n}',
					output: "Bio contém tecnologia-chave: PHP",
					tags: [
						"php",
						"strings",
						"validacao",
						"trim",
						"strpos",
						"formulario",
					],
				},
			],
		},
		{
			id: "transformacao-strings",
			name: "Transformação de Strings",
			layout: "single",
			entries: [
				{
					title: "Normalizar texto para uso interno",
					kicker: "Padronizar antes de salvar ou comparar",
					description:
						"Transformar string é aplicar uma sequência de limpeza para deixar o dado previsível. Use em login, cadastro e integração para reduzir diferença entre entrada do usuário e padrão interno.",
					descriptionTone: "default",
					code: '<?php\n$nomeEntrada = "  Ana   SILVA  ";\n\n$nomeNormalizado = trim($nomeEntrada); // Remove bordas\n$nomeNormalizado = str_replace("  ", " ", $nomeNormalizado); // Reduz espaço duplo simples\n$nomeNormalizado = strtolower($nomeNormalizado); // Padroniza caixa para comparação\n\necho "Nome normalizado: " . $nomeNormalizado . PHP_EOL;',
					output: "Nome normalizado: ana silva",
					tags: [
						"php",
						"strings",
						"transformacao",
						"normalizacao",
						"cadastro",
						"limpeza",
					],
				},
				{
					title: "Transformar valores para formato de exibição",
					kicker: "Separar dado bruto de dado amigável",
					description:
						"Nem sempre o formato recebido é o melhor para exibir. Transforme apenas para apresentação sem perder o valor bruto original.",
					descriptionTone: "default",
					code: '<?php\n$statusBruto = "pedido_em_analise";\n\n$statusTela = str_replace("_", " ", $statusBruto); // Troca separador técnico\n$statusTela = strtoupper(substr($statusTela, 0, 1)) . substr($statusTela, 1); // Ajusta inicial\n\necho "Status exibido: " . $statusTela . PHP_EOL;',
					output: "Status exibido: Pedido em analise",
					tags: [
						"php",
						"strings",
						"transformacao",
						"formatacao",
						"status",
						"ui",
					],
				},
			],
		},
		{
			id: "conversao-string-array",
			name: "Conversão entre String e Array",
			layout: "single",
			entries: [
				{
					title: "explode(): quebrar string em partes",
					kicker: "Útil para tags, CSV simples e filtros",
					description:
						"`explode($separador, $texto, $limiteOpcional)` divide `$texto` usando `$separador` e devolve um array. O terceiro parâmetro é opcional para limitar quantas partes retornar. Use quando dados chegam em linha única e você precisa tratar item por item.",
					descriptionTone: "default",
					code: '<?php\n$tags = "php,api,backend";\n\n$lista = explode(",", $tags); // Exemplo simples\nprint_r($lista);\n\n$filtrosQuery = "status:ativo|perfil:admin|canal:email";\n$filtros = explode("|", $filtrosQuery); // Exemplo prático para query de API\nprint_r($filtros);',
					output: "Array\n(\n    [0] => php\n    [1] => api\n    [2] => backend\n)\nArray\n(\n    [0] => status:ativo\n    [1] => perfil:admin\n    [2] => canal:email\n)",
					tags: [
						"php",
						"strings",
						"explode",
						"conversao",
						"array",
						"api",
					],
				},
				{
					title: "implode(): juntar array em string",
					kicker: "Gerar saída textual para log, API e banco",
					description:
						"`implode($separador, $itens)` junta o array `$itens` em uma string, inserindo `$separador` entre os valores. Use para montar CSV, lista de erros e campos serializados para integração.",
					descriptionTone: "default",
					code: '<?php\n$tecnologias = ["PHP", "MySQL", "Docker"];\n\necho implode(", ", $tecnologias) . PHP_EOL; // Exemplo simples\n\n$erros = ["email inválido", "senha curta", "termos não aceitos"];\n$resumoErros = implode(" | ", $erros); // Exemplo prático para resposta de API\n\necho "Erros: " . $resumoErros . PHP_EOL;',
					output: "PHP, MySQL, Docker\nErros: email inválido | senha curta | termos não aceitos",
					tags: [
						"php",
						"strings",
						"implode",
						"conversao",
						"array",
						"api",
					],
				},
			],
		},
		{
			id: "exemplos-praticos-dia-a-dia",
			name: "Exemplos práticos do dia a dia",
			layout: "single",
			entries: [
				{
					title: "Manipular nome de usuário",
					kicker: "Normalizar para login e comparação",
					description:
						"Antes de salvar nome de usuário, limpe espaços e padronize caixa. Isso evita duplicidade aparente entre `Ana`, ` ana ` e `ANA`.",
					descriptionTone: "default",
					code: '<?php\n$entrada = "  ANA.SILVA  ";\n\n$usuario = strtolower(trim($entrada)); // Normaliza para padrão interno\n$usuario = str_replace(" ", "", $usuario); // Remove espaços internos no username\n\necho "Usuário final: " . $usuario . PHP_EOL;',
					output: "Usuário final: ana.silva",
					tags: [
						"php",
						"strings",
						"usuario",
						"normalizacao",
						"cadastro",
						"login",
					],
				},
				{
					title: "Tratar dados de formulário",
					kicker: "Limpar e validar antes de processar",
					description:
						"Dados de formulário chegam com ruído: espaços, caixa inconsistente e campos vazios. Faça limpeza e validação mínima antes de persistir.",
					descriptionTone: "default",
					code: '<?php\n$nomeForm = "  Carla Nunes  ";\n$emailForm = " CARLA@EMAIL.COM ";\n\n$nome = trim($nomeForm); // Remove espaços excedentes\n$email = strtolower(trim($emailForm)); // Normaliza email para busca/login\n\nif ($nome === "" || strpos($email, "@") === false) {\n    echo "Dados inválidos" . PHP_EOL;\n} else {\n    echo "Dados prontos para salvar" . PHP_EOL;\n}',
					output: "Dados prontos para salvar",
					tags: [
						"php",
						"strings",
						"formulario",
						"validacao",
						"trim",
						"email",
					],
				},
				{
					title: "Preparar dados para API",
					kicker: "Padronizar payload textual antes do envio",
					description:
						"API costuma depender de padrões estritos. Padronize campos textuais antes de `json_encode` para reduzir erro de validação no serviço externo.",
					descriptionTone: "default",
					code: '<?php\n$nomeProduto = "  Mouse Gamer RGB  ";\n$categorias = "hardware,perifericos,gamer";\n\n$payload = [\n    "nome" => trim($nomeProduto), // Remove bordas do texto\n    "slug" => str_replace(" ", "-", strtolower(trim($nomeProduto))), // Gera chave amigável para URL\n    "categorias" => explode(",", strtolower($categorias)), // Converte lista textual em array\n];\n\necho json_encode($payload, JSON_UNESCAPED_UNICODE) . PHP_EOL;',
					output: "{\"nome\":\"Mouse Gamer RGB\",\"slug\":\"mouse-gamer-rgb\",\"categorias\":[\"hardware\",\"perifericos\",\"gamer\"]}",
					tags: [
						"php",
						"strings",
						"api",
						"payload",
						"json",
						"normalizacao",
					],
				},
				{
					title: "Extrair partes de email e URL",
					kicker: "Separar domínio, usuário e caminho",
					description:
						"Extrair partes da string ajuda em regra de negócio, analytics e validação. Use `strpos`, `substr` e `explode` para quebrar dados estruturados de forma simples.",
					descriptionTone: "default",
					code: '<?php\n$email = "ana.silva@empresa.com";\n$arroba = strpos($email, "@");\n\n$usuarioEmail = substr($email, 0, $arroba); // Parte antes do @\n$dominioEmail = substr($email, $arroba + 1); // Parte depois do @\n\necho "Usuário email: " . $usuarioEmail . PHP_EOL;\necho "Domínio email: " . $dominioEmail . PHP_EOL;\n\n$url = "https://api.exemplo.com/v1/usuarios/lista";\n$partesUrl = explode("/", $url); // Quebra URL em segmentos\n\necho "Último segmento da URL: " . end($partesUrl) . PHP_EOL;',
					output: "Usuário email: ana.silva\nDomínio email: empresa.com\nÚltimo segmento da URL: lista",
					tags: [
						"php",
						"strings",
						"extracao",
						"email",
						"url",
						"api",
					],
				},
			],
		},
		{
			id: "boas-praticas-strings",
			name: "Boas práticas",
			layout: "single",
			entries: [
				{
					title: "Padronizar entrada e saída de texto",
					kicker: "Consistência reduz bug de comparação e busca",
					description:
						"Defina um fluxo fixo: limpar (`trim`), normalizar (`strtolower`) e validar (`strpos`, tamanho). Use esse padrão em todo ponto de entrada de texto para evitar tratamento diferente em cada endpoint.",
					descriptionTone: "default",
					code: '<?php\nfunction normalizarEmail(string $email): string\n{\n    return strtolower(trim($email)); // Fluxo padrão para email\n}\n\n$emailEntrada = " ANA@EMAIL.COM ";\n$email = normalizarEmail($emailEntrada);\n\necho "Email normalizado: " . $email . PHP_EOL;',
					output: "Email normalizado: ana@email.com",
					tags: [
						"php",
						"strings",
						"boas-praticas",
						"padrao",
						"normalizacao",
						"validacao",
					],
					callout: {
						type: "hint",
						label: "Checklist rápido:",
						text: "trim na entrada, comparação estrita, validação de conteúdo e padronização de caixa antes de salvar.",
					},
				},
				{
					title: "Atenção com acentos e multibyte",
					kicker: "strlen pode contar bytes, não caracteres visuais",
					description:
						"Em textos com acento e caracteres multibyte, funções comuns podem gerar contagem inesperada. `mb_strlen($texto, $encoding)` recebe a string e o encoding (ex.: `UTF-8`) para contar caracteres visuais corretamente.",
					descriptionTone: "default",
					code: '<?php\n$texto = "ação";\n\necho "strlen: " . strlen($texto) . PHP_EOL; // Pode contar bytes\n\necho "mb_strlen: " . mb_strlen($texto, "UTF-8") . PHP_EOL; // Conta caracteres visuais',
					output: "strlen: 5\nmb_strlen: 4",
					tags: [
						"php",
						"strings",
						"utf8",
						"mb_strlen",
						"acentos",
						"boas-praticas",
					],
				},
			],
		},
		{
			id: "erros-comuns-strings",
			name: "Erros comuns",
			layout: "single",
			entries: [
				{
					title: "Erros clássicos em manipulação de string",
					kicker: "Pequenos detalhes que geram bug silencioso",
					description:
						"Os erros mais frequentes são: `strpos` com validação errada, comparação frouxa, esquecer `trim` e confundir aspas simples com duplas. Corrigir esses pontos evita comportamento inconsistente em produção.",
					descriptionTone: "warn",
					code: '<?php\n$texto = "api:ok";\n\nif (strpos($texto, "api") ) { // Errado: posição 0 vira false\n    echo "Encontrou api (errado)" . PHP_EOL;\n}\n\nif (strpos($texto, "api") !== false) { // Correto: valida posição 0\n    echo "Encontrou api (correto)" . PHP_EOL;\n}\n\n$valor = "  admin ";\nif ($valor === "admin") {\n    echo "Perfil válido (sem trim)" . PHP_EOL; // Não entra por espaço extra\n}\n\nif (trim($valor) === "admin") {\n    echo "Perfil válido (com trim)" . PHP_EOL; // Validação correta\n}\n\n$nome = "Ana";\necho \'Olá, $nome\' . PHP_EOL; // Erro comum: esperava interpolação com aspas simples',
					output: "Encontrou api (correto)\nPerfil válido (com trim)\nOlá, $nome",
					tags: [
						"php",
						"strings",
						"erros-comuns",
						"strpos",
						"trim",
						"comparacao",
					],
					callout: {
						type: "danger",
						label: "Perigo:",
						text: "bugs de string costumam parecer intermitentes porque dependem do formato exato de entrada.",
					},
				},
			],
		},
	],
};
