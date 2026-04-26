window.DOC_DATA_REGISTRY = window.DOC_DATA_REGISTRY || {};
window.DOC_DATA_REGISTRY["php-banco-dados"] = {
	id: "php-banco-dados",
	title: "PHP: Conexão e Manipulação de Banco de Dados",
	subtitle:
		"Referência prática para conectar com PDO, consultar dados e executar CRUD com segurança no dia a dia.",
	searchPlaceholder: "Buscar PDO, SELECT, INSERT, SQL Injection ou palavra...",
	shortcutHint: "Atalho: pressione / para focar a busca.",
	codeLanguage: "php",
	defaultSectionLayout: "single",
	quickStart: {
		title: "Como testar os exemplos desta documentação",
		kicker: "Pré-requisitos e base mínima para o CRUD",
		description:
			"Os exemplos usam `PDO` com `pdo_mysql` ativo e uma tabela `usuarios` simples para CRUD.",
		steps: [
			"Verifique o PHP com `php --version`.",
			"Confirme o driver com `php -m`.",
			"Crie o banco e a tabela `usuarios`.",
			"Ajuste host, banco, usuário e senha no exemplo.",
			"Salve um snippet em `db.php` e rode `php db.php`.",
		],
		codeLanguage: "sql",
		code: "CREATE DATABASE devdocs_php_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\nUSE devdocs_php_db;\n\nCREATE TABLE usuarios (\n    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,\n    nome VARCHAR(120) NOT NULL,\n    email VARCHAR(160) NOT NULL UNIQUE,\n    status VARCHAR(20) NOT NULL DEFAULT 'ativo'\n);",
		callout: {
			type: "hint",
			label: "Dica:",
			text: "use `charset=utf8mb4` no DSN para evitar problema com acentuação e caracteres especiais.",
		},
	},
	sections: [
		{
			id: "o-que-e-pdo",
			name: "1. O que é PDO",
			layout: "single",
			entries: [
				{
					title: "PDO é a forma mais prática de falar com o banco no PHP",
					kicker: "Conexão padronizada com suporte a prepared statements",
					description:
						"`PDO` é a extensão do PHP usada para conectar no banco e executar SQL com uma API consistente. Vale usar porque facilita conexão, tratamento de erro e consultas seguras com `prepare()`.",
					code: '<?php\n$pdo = new PDO(\n    "mysql:host=127.0.0.1;dbname=devdocs_php_db;charset=utf8mb4",\n    "root",\n    ""\n);\n\necho $pdo instanceof PDO ? "PDO conectado" . PHP_EOL : "Falha";',
					output: "PDO conectado",
					tags: ["php", "pdo", "conceito", "conexao", "base", "crud"],
				},
			],
		},
		{
			id: "como-conectar",
			name: "2. Como conectar no banco",
			layout: "single",
			entries: [
				{
					title: "Conexão simples com DSN, usuário, senha e try/catch",
					kicker: "Base segura para abrir a conexão",
					description:
						"O `DSN` informa driver, host, banco e charset. `usuário` e `senha` autenticam a conexão. Use `try/catch` para tratar erro sem expor detalhes técnicos para o usuário.",
					code: '<?php\n$dsn = "mysql:host=127.0.0.1;dbname=devdocs_php_db;charset=utf8mb4";\n$user = "root";\n$password = "";\n\ntry {\n    $pdo = new PDO($dsn, $user, $password, [\n        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,\n        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,\n        PDO::ATTR_EMULATE_PREPARES => false,\n    ]);\n\n    echo "Conexão criada com sucesso" . PHP_EOL;\n} catch (PDOException $e) {\n    error_log($e->getMessage());\n    echo "Não foi possível conectar ao banco." . PHP_EOL;\n}',
					output: "Conexão criada com sucesso",
					tags: ["php", "pdo", "dsn", "try-catch", "conexao", "charset"],
					callout: {
						type: "hint",
						label: "DSN:",
						text: "`host` aponta o servidor, `dbname` define a base, `charset=utf8mb4` evita problema de codificação.",
					},
				},
				{
					title: "Boa prática com config.php e DatabaseConnection.php",
					kicker: "Separar configuração da criação do PDO",
					description:
						"Separar credenciais em `config.php` deixa a manutenção mais simples e evita repetir dados sensíveis em vários pontos do sistema.",
					code: '<?php\n// config.php\nreturn [\n    "dsn" => "mysql:host=127.0.0.1;dbname=devdocs_php_db;charset=utf8mb4",\n    "user" => "root",\n    "password" => "",\n];\n\n// DatabaseConnection.php\nfinal class DatabaseConnection\n{\n    public static function make(): PDO\n    {\n        $config = require __DIR__ . "/config.php";\n\n        return new PDO($config["dsn"], $config["user"], $config["password"], [\n            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,\n            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,\n        ]);\n    }\n}',
					tags: ["php", "config", "databaseconnection", "pdo", "organizacao", "boas-praticas"],
				},
			],
		},
		{
			id: "consultar-dados",
			name: "3. Como consultar dados",
			layout: "single",
			entries: [
				{
					title: "Buscar um único registro com prepare, execute e fetch",
					kicker: "Ideal para usuário por ID",
					description:
						"Use `prepare(string $sql)` para montar a query, `execute(array $params)` para enviar os valores e `fetch()` quando você espera apenas uma linha. Em `execute`, o array liga cada placeholder (ex: `:id`) ao valor correspondente.",
					code: '<?php\n$pdo = DatabaseConnection::make();\n\n$stmt = $pdo->prepare("SELECT id, nome, email FROM usuarios WHERE id = :id");\n$stmt->execute([":id" => 7]);\n\n$usuario = $stmt->fetch();\n\nif ($usuario) {\n    echo $usuario["nome"] . " <" . $usuario["email"] . ">" . PHP_EOL;\n}',
					output: "Ana Silva <ana@email.com>",
					tags: ["php", "select", "prepare", "execute", "fetch", "pdo"],
				},
				{
					title: "Listar várias linhas com fetchAll",
					kicker: "Bom para listas pequenas e telas simples",
					description:
						"`fetchAll()` devolve todas as linhas em um array. Funciona bem para listas pequenas. Em tabelas grandes, o ideal é paginar.",
					code: '<?php\n$pdo = DatabaseConnection::make();\n\n$stmt = $pdo->prepare("SELECT id, nome, status FROM usuarios WHERE status = :status ORDER BY id DESC LIMIT 5");\n$stmt->execute([":status" => "ativo"]);\n\n$usuarios = $stmt->fetchAll();\n\nforeach ($usuarios as $usuario) {\n    echo $usuario["id"] . " - " . $usuario["nome"] . PHP_EOL;\n}',
					output: "9 - Carla Lima\n8 - Bruno Costa\n7 - Ana Silva",
					tags: ["php", "select", "fetchall", "lista", "pdo", "consulta"],
					callout: {
						type: "warn",
						label: "Atenção:",
						text: "evite `fetchAll()` em tabelas muito grandes sem paginação.",
					},
				},
			],
		},
		{
			id: "criar-registros",
			name: "4. Como criar registros",
			layout: "single",
			entries: [
				{
					title: "Inserir usuário com INSERT e placeholders",
					kicker: "Salvar dados sem concatenar valores na query",
					description:
						"Use placeholders para separar o SQL dos valores enviados. O `execute(array $params)` recebe um mapa `placeholder => valor`, por exemplo `:nome => \"Ana\"`. Isso deixa o código mais seguro e mais fácil de manter.",
					code: '<?php\n$pdo = DatabaseConnection::make();\n\n$sql = "INSERT INTO usuarios (nome, email, status) VALUES (:nome, :email, :status)";\n$stmt = $pdo->prepare($sql);\n$stmt->execute([\n    ":nome" => "Ana Silva",\n    ":email" => "ana@email.com",\n    ":status" => "ativo",\n]);\n\necho "Novo ID: " . $pdo->lastInsertId() . PHP_EOL;',
					output: "Novo ID: 10",
					tags: ["php", "insert", "placeholders", "pdo", "crud", "usuarios"],
				},
			],
		},
		{
			id: "alterar-registros",
			name: "5. Como alterar registros",
			layout: "single",
			entries: [
				{
					title: "Atualizar dados com UPDATE",
					kicker: "Mudar campos sem recriar o registro",
					description:
						"Use `UPDATE` quando o registro já existe e você precisa alterar nome, email, status ou outro campo.",
					code: '<?php\n$pdo = DatabaseConnection::make();\n\n$sql = "UPDATE usuarios SET nome = :nome, status = :status WHERE id = :id";\n$stmt = $pdo->prepare($sql);\n$stmt->execute([\n    ":id" => 10,\n    ":nome" => "Ana Souza",\n    ":status" => "inativo",\n]);\n\necho "Linhas afetadas: " . $stmt->rowCount() . PHP_EOL;',
					output: "Linhas afetadas: 1",
					tags: ["php", "update", "pdo", "crud", "usuarios", "rowcount"],
				},
			],
		},
		{
			id: "deletar-registros",
			name: "6. Como deletar registros",
			layout: "single",
			entries: [
				{
					title: "Remover um registro com DELETE",
					kicker: "Exclusão direta quando a regra permitir",
					description:
						"Use `DELETE` quando a regra realmente permitir exclusão física. Se o sistema precisa de histórico, prefira inativar o registro.",
					code: '<?php\n$pdo = DatabaseConnection::make();\n\n$stmt = $pdo->prepare("DELETE FROM usuarios WHERE id = :id");\n$stmt->execute([":id" => 10]);\n\necho "Linhas removidas: " . $stmt->rowCount() . PHP_EOL;',
					output: "Linhas removidas: 1",
					tags: ["php", "delete", "pdo", "crud", "usuarios", "rowcount"],
				},
			],
		},
		{
			id: "prepared-statements",
			name: "7. Prepared Statements e SQL Injection",
			layout: "single",
			entries: [
				{
					title: "O que é SQL Injection e por que prepare resolve isso",
					kicker: "Não concatenar entrada do usuário em SQL",
					description:
						"`SQL Injection` acontece quando valor vindo de fora entra direto na query e altera a lógica do SQL. `prepare()` resolve isso separando a estrutura da consulta dos dados enviados.",
					code: '<?php\n$id = $_GET["id"] ?? "1";\n\n// ERRADO\n$sqlErrado = "SELECT id, nome FROM usuarios WHERE id = " . $id;\n\n// CERTO\n$pdo = DatabaseConnection::make();\n$stmt = $pdo->prepare("SELECT id, nome FROM usuarios WHERE id = :id");\n$stmt->execute([":id" => (int) $id]);\n\nprint_r($stmt->fetch());',
					tags: ["php", "prepared-statements", "sql-injection", "prepare", "seguranca", "pdo"],
					callout: {
						type: "danger",
						label: "Perigo:",
						text: "nunca monte SQL com dado vindo de `GET`, `POST`, JSON ou formulário por concatenação direta.",
					},
				},
				{
					title: "bindValue: quando usar e qual risco evitar",
					kicker: "Valor imediato, ideal para a maioria dos CRUDs",
					description:
						"`bindValue(string $param, mixed $value, int $type = PDO::PARAM_STR)` envia o valor no momento do bind. `$param` é o placeholder (ex: `:id`), `$value` é o valor enviado e `$type` define o tipo PDO. É a opção mais previsível para entradas simples de formulário, filtros e CRUD. O risco mais comum é passar tipo errado e ter comparação inesperada no banco.",
					code: '<?php\n$pdo = DatabaseConnection::make();\n\n$stmt = $pdo->prepare("SELECT id, nome FROM usuarios WHERE id = :id AND status = :status");\n$stmt->bindValue(":id", 7, PDO::PARAM_INT);\n$stmt->bindValue(":status", "ativo", PDO::PARAM_STR);\n$stmt->execute();\n\nprint_r($stmt->fetch());',
					tags: ["php", "bindvalue", "param-int", "param-str", "pdo", "prepared-statements"],
					callout: {
						type: "hint",
						label: "Quando usar:",
						text: "prefira `bindValue()` quando o valor já está pronto e não vai mudar antes do `execute()`.",
					},
				},
				{
					title: "bindParam: quando usar e qual risco evitar",
					kicker: "Variável por referência, útil para reuso de statement",
					description:
						"`bindParam(string $param, mixed &$var, int $type = PDO::PARAM_STR)` liga o placeholder à variável por referência e só usa o valor final no `execute()`. `$param` é o placeholder, `$var` é a variável ligada por referência e `$type` define o tipo PDO. Funciona bem quando você reaproveita a mesma query em loop mudando a variável. O risco é alterar essa variável sem perceber antes do `execute()` e consultar/salvar dados diferentes do esperado.",
					code: '<?php\n$pdo = DatabaseConnection::make();\n\n$status = "ativo";\n$stmt = $pdo->prepare("SELECT id, nome, status FROM usuarios WHERE status = :status LIMIT 2");\n$stmt->bindParam(":status", $status, PDO::PARAM_STR);\n\n$status = "inativo"; // Valor final que sera usado no execute\n$stmt->execute();\n\nprint_r($stmt->fetchAll());',
					tags: ["php", "bindparam", "param-str", "pdo", "prepared-statements", "consulta"],
					callout: {
						type: "warn",
						label: "Atenção:",
						text: "evite reutilizar a mesma variável em fluxos longos sem controle, para não enviar valor errado por referência.",
					},
				},
				{
					title: "bindValue x bindParam em leitura rápida",
					kicker: "Escolha pelo momento em que o valor é resolvido",
					description:
						"Os dois ajudam no prepared statement, mas servem melhor para cenários diferentes. A comparação abaixo ajuda a decidir sem precisar reler toda a teoria.",
					contentBlocks: [
						{
							type: "comparison-block",
							title: "Comparação direta",
							columns: [
								{
									title: "bindValue",
									description: "Resolve o valor no momento do bind.",
									items: [
										"Melhor para formulário, filtros e CRUD simples.",
										"Mais previsível quando o valor já está pronto.",
										"Evita surpresa com variável mudando antes do `execute()`.",
									],
								},
								{
									title: "bindParam",
									description: "Liga o placeholder à variável por referência.",
									items: [
										"Útil quando a mesma query roda várias vezes mudando a variável.",
										"O valor final só é lido no `execute()`.",
										"Exige mais cuidado em fluxos longos para não enviar dado inesperado.",
									],
								},
							],
						},
					],
					tags: ["php", "bindvalue", "bindparam", "comparacao", "pdo", "prepared-statements"],
				},
			],
		},
		{
			id: "tratamento-erros",
			name: "8. Tratamento de erros",
			layout: "single",
			entries: [
				{
					title: "Usar try/catch com mensagem segura",
					kicker: "Erro técnico no log, resposta simples para o usuário",
					description:
						"Em ambiente real, o usuário não precisa ver stack trace nem credencial. O ideal é registrar o erro tecnicamente e responder com uma mensagem curta.",
					code: '<?php\ntry {\n    $pdo = DatabaseConnection::make();\n    $stmt = $pdo->prepare("SELECT id, nome FROM usuarios WHERE id = :id");\n    $stmt->execute([":id" => 7]);\n\n    print_r($stmt->fetch());\n} catch (Throwable $e) {\n    error_log($e->getMessage());\n    echo "Erro interno ao consultar dados." . PHP_EOL;\n}',
					output: "Array\n(\n    [id] => 7\n    [nome] => Ana Silva\n)",
					tags: ["php", "try-catch", "erros", "pdo", "log", "seguranca"],
					callout: {
						type: "hint",
						label: "Ambiente:",
						text: "detalhe técnico no log faz sentido em desenvolvimento; mensagem simples faz sentido para usuário final.",
					},
				},
			],
		},
		{
			id: "boas-praticas",
			name: "9. Boas práticas",
			layout: "single",
			entries: [
				{
					title: "Checklist curto para acesso ao banco com PDO",
					kicker: "Decisões simples que evitam problema depois",
					description:
						"Separe `config.php`, use `charset=utf8mb4`, valide dados antes do banco, não exponha credenciais e evite SQL direto no controller. `Service` e `Repository` fazem sentido quando o projeto começa a crescer.",
					contentBlocks: [
						{
							type: "checklist-block",
							title: "Antes de fechar o acesso ao banco",
							items: [
								"Separe `config.php` da criação da conexão.",
								"Use `charset=utf8mb4` no DSN.",
								"Valide dados antes de montar o `execute()`.",
								"Não exponha credenciais nem mensagem técnica para o usuário final.",
								"Evite SQL direto no controller quando o projeto começar a crescer.",
								"Use `fetchAll()` só com volume pequeno ou paginação.",
							],
						},
						{
							type: "context-block",
							variant: "good-practice",
							label: "Fechamento:",
							text: "o trio mais importante continua o mesmo: prepared statement sempre, validação antes do SQL e mensagens técnicas apenas em log.",
						},
					],
					tags: ["php", "boas-praticas", "validacao", "config", "repository", "service"],
				},
			],
		},
		{
			id: "constantes-opcoes-pdo",
			name: "10. Constantes e opções comuns do PDO",
			layout: "single",
			entries: [
				{
					title: "Constantes mais usadas no dia a dia",
					kicker: "Opções pequenas que mudam o comportamento do PDO",
					description:
						"Essas são algumas das constantes e opções mais usadas com `PDO` no dia a dia. O objetivo aqui é servir como consulta rápida: o nome da constante e o que ela faz.",
					contentBlocks: [
						{
							type: "tech-list",
							items: [
								{
									term: "PDO::PARAM_STR",
									description: "Define que o valor enviado no bind deve ser tratado como string.",
								},
								{
									term: "PDO::PARAM_INT",
									description: "Define que o valor enviado no bind deve ser tratado como inteiro.",
								},
								{
									term: "PDO::PARAM_BOOL",
									description: "Define que o valor enviado no bind deve ser tratado como booleano.",
								},
								{
									term: "PDO::FETCH_ASSOC",
									description: "Faz o fetch retornar array associativo, usando o nome das colunas como chave.",
								},
								{
									term: "PDO::FETCH_OBJ",
									description: "Faz o fetch retornar objeto em vez de array.",
								},
								{
									term: "PDO::ATTR_ERRMODE",
									description: "Define como o PDO reage quando acontece um erro.",
								},
								{
									term: "PDO::ERRMODE_EXCEPTION",
									description: "Faz o PDO lançar exceção em caso de erro. É a opção mais usada em projetos atuais.",
								},
								{
									term: "PDO::ATTR_DEFAULT_FETCH_MODE",
									description: "Define o modo padrão de retorno do fetch, sem precisar repetir isso em toda consulta.",
								},
								{
									term: "PDO::ATTR_EMULATE_PREPARES",
									description: "Controla se o prepare será emulado pelo driver ou executado de forma nativa pelo banco.",
								},
								{
									term: "PDO::PARAM_NULL",
									description: "Define que o valor enviado no bind deve ser tratado como `null`.",
								},
							],
						},
					],
					tags: ["php", "pdo", "param-int", "param-str", "fetch-assoc", "errmode"],
				},
			],
		},
		{
			id: "visao-geral-arquivos",
			name: "11. Exemplo simples mais completo",
			layout: "single",
			entries: [
				{
					title: "Como config, conexão, model, service e controller se conectam",
					kicker: "Visão geral curta sem montar um sistema grande",
					description:
						"A ideia aqui é mostrar o papel de cada arquivo: `config.php` guarda configuração, `DatabaseConnection.php` cria o PDO, `UsuarioModel.php` faz o SQL, `UsuarioService.php` valida regra e `UsuarioController.php` recebe a requisição.",
					code: '<?php\n// config.php\nreturn [\n    "dsn" => "mysql:host=127.0.0.1;dbname=devdocs_php_db;charset=utf8mb4",\n    "user" => "root",\n    "password" => "",\n];\n\n// DatabaseConnection.php\nfinal class DatabaseConnection\n{\n    public static function make(): PDO\n    {\n        $config = require __DIR__ . "/config.php";\n        return new PDO($config["dsn"], $config["user"], $config["password"]);\n    }\n}\n\n// UsuarioModel.php\nfinal class UsuarioModel\n{\n    public function __construct(private PDO $pdo) {}\n\n    public function listar(): array\n    {\n        return $this->pdo->query("SELECT id, nome FROM usuarios")->fetchAll(PDO::FETCH_ASSOC);\n    }\n}\n\n// UsuarioService.php\nfinal class UsuarioService\n{\n    public function __construct(private UsuarioModel $model) {}\n\n    public function listarUsuarios(): array\n    {\n        return $this->model->listar();\n    }\n}\n\n// UsuarioController.php\n$service = new UsuarioService(new UsuarioModel(DatabaseConnection::make()));\nprint_r($service->listarUsuarios());',
					tags: ["php", "config", "databaseconnection", "usuariomodel", "usuarioservice", "usuariocontroller"],
				},
			],
		},
	],
};
