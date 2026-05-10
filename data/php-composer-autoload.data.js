window.DOC_DATA_REGISTRY = window.DOC_DATA_REGISTRY || {};
window.DOC_DATA_REGISTRY["php-composer-autoload"] = {
	id: "php-composer-autoload",
	title: "PHP: Composer e autoload",
	subtitle:
		"Guia prático para instalar o Composer, declarar dependências, configurar autoload PSR-4 e ligar classes com namespaces.",
	searchPlaceholder: "Buscar composer, psr-4, vendor, autoload ou palavra...",
	shortcutHint: "Atalho: pressione / para focar a busca.",
	codeLanguage: "php",
	defaultSectionLayout: "single",
	quickStart: {
		title: "Como testar os exemplos desta documentação",
		kicker: "Composer instalado e PHP CLI",
		description:
			"Instale o Composer globalmente (https://getcomposer.org/). Os exemplos PHP assumem que existe `vendor/autoload.php` gerado após `composer install` ou `composer dump-autoload` no diretório do projeto.",
		steps: [
			"Verifique `composer --version` e `php --version`.",
			"Crie uma pasta vazia e rode `composer init` (interativo) ou copie o `composer.json` de exemplo desta página.",
			"Execute `composer install` ou `composer dump-autoload` conforme indicado.",
			"Rode os scripts PHP a partir da raiz do projeto (onde está `composer.json`).",
		],
		codeLanguage: "shell",
		code: "composer --version\ncomposer install",
		callout: {
			type: "hint",
			label: "Documentação relacionada:",
			text: "`PHP: Orientação a Objetos` para classes e namespaces; `PHP: JSON` se instalar bibliotecas que manipulam JSON.",
		},
	},
	sections: [
		{
			id: "o-que-e-composer",
			name: "O que é o Composer",
			layout: "single",
			entries: [
				{
					title: "Gestor de dependências e autoload do ecossistema PHP",
					kicker: "composer.json, composer.lock e pasta vendor",
					description:
						"O Composer lê `composer.json` (o que o projeto precisa), resolve versões, grava `composer.lock` com versões exatas (em aplicações deve ir para o Git) e instala pacotes em `vendor/`. O ficheiro `vendor/autoload.php` registra o autoload das dependências e do teu código se declarares `autoload` no JSON.",
					descriptionTone: "default",
					code: "meu-projeto/\n  composer.json      # declaração do projeto e dependências\n  composer.lock      # versões travadas (commit em apps)\n  vendor/            # código de terceiros (não editar à mão)\n    autoload.php     # ponto de entrada do autoload\n  src/               # teu código (exemplo comum com PSR-4)",
					codeLanguage: "shell",
					tags: [
						"php",
						"composer",
						"vendor",
						"composer-json",
						"dependencias",
					],
				},
			],
		},
		{
			id: "composer-init-require",
			name: "Iniciar projeto e instalar pacotes",
			layout: "single",
			entries: [
				{
					title: "composer init e composer require",
					kicker: "Criar projeto e adicionar bibliotecas",
					description:
						"`composer init` cria o `composer.json` base. `composer require nome/pacote` adiciona a dependência e instala. Use `composer require --dev pacote` para ferramentas só de desenvolvimento (testes, análise estática).",
					descriptionTone: "default",
					code: "composer init\ncomposer require monolog/monolog\ncomposer require --dev phpunit/phpunit",
					codeLanguage: "shell",
					tags: [
						"php",
						"composer",
						"require",
						"init",
						"dev",
					],
					callout: {
						type: "hint",
						label: "Dica:",
						text: "em CI use `composer install --no-dev --prefer-dist` para builds de produção quando não precisar de dependências de desenvolvimento.",
					},
				},
			],
		},
		{
			id: "autoload-psr4",
			name: "Autoload PSR-4 no composer.json",
			layout: "single",
			entries: [
				{
					title: "Mapear namespace para pasta src",
					kicker: "Prefixo de namespace aponta para diretório",
					description:
						"PSR-4 diz: o sufixo do namespace (após o prefixo registado) corresponde ao caminho do ficheiro. Ex.: com `\"App\\\\\": \"src/\"`, a classe `App\\Modelo\\Pedido` fica em `src/Modelo/Pedido.php`. O nome do ficheiro deve coincidir com o nome da classe.",
					descriptionTone: "default",
					code: '{\n  "name": "exemplo/app",\n  "autoload": {\n    "psr-4": {\n      "App\\\\": "src/"\n    }\n  },\n  "require": {\n    "php": ">=8.0"\n  }\n}',
					codeLanguage: "json",
					tags: [
						"php",
						"psr-4",
						"autoload",
						"composer-json",
						"namespace",
					],
				},
				{
					title: "Classe PHP alinhada ao PSR-4",
					kicker: "declare(strict_types=1) e namespace no topo",
					description:
						"Depois de configurar o `composer.json`, rode `composer dump-autoload` sempre que adicionar namespaces novos ou mudar o mapeamento. No script de entrada, `require 'vendor/autoload.php';` carrega todas as classes registadas.",
					descriptionTone: "default",
					code: '<?php\ndeclare(strict_types=1);\n\nnamespace App\\Modelo;\n\nfinal class Pedido\n{\n    public function __construct(public int $id) {}\n}\n\n// Em outro ficheiro, após vendor/autoload.php:\n// use App\\Modelo\\Pedido;\n// $p = new Pedido(1);',
					tags: [
						"php",
						"namespace",
						"class",
						"psr-4",
						"src",
					],
					callout: {
						type: "hint",
						label: "Lembrete:",
						text: "no JSON real do Composer use uma única barra invertida escapada (`App\\\\`) como no exemplo da documentação; ao editar o ficheiro no disco, o Composer espera o formato JSON válido.",
					},
				},
			],
		},
		{
			id: "use-bootstrap",
			name: "use e bootstrap da aplicação",
			layout: "single",
			entries: [
				{
					title: "Importar classes com use e caminho totalmente qualificado",
					kicker: "Evitar nomes longos no meio do código",
					description:
						"`use App\\Servico\\Email;` no topo do ficheiro permite escrever `new Email()` em vez do nome completo. Em scripts únicos, `require __DIR__ . '/vendor/autoload.php';` usa a pasta do próprio script como base. No projeto real a classe `Pedido` viria de `src/Modelo/Pedido.php` carregada pelo autoload; aqui o exemplo está num único ficheiro só para ilustrar `use`.",
					descriptionTone: "default",
					code: '<?php\ndeclare(strict_types=1);\n\n// require __DIR__ . "/vendor/autoload.php"; // descomente quando vendor existir\n\nnamespace App\\Modelo {\n    final class Pedido\n    {\n        public function __construct(public int $id) {}\n    }\n}\n\nnamespace {\n    use App\\Modelo\\Pedido;\n\n    $pedido = new Pedido(99);\n    echo "Pedido #{$pedido->id}" . PHP_EOL;\n}',
					output: "Pedido #99",
					tags: [
						"php",
						"use",
						"autoload",
						"require",
						"bootstrap",
					],
				},
			],
		},
		{
			id: "dump-autoload-scripts",
			name: "dump-autoload e scripts",
			layout: "single",
			entries: [
				{
					title: "Regenerar mapas de classe",
					kicker: "composer dump-autoload -o",
					description:
						"Após mover ficheiros ou alterar `autoload` no JSON, execute `composer dump-autoload`. A flag `-o` (otimizado) gera classmaps mais rápidos em produção. Scripts definidos em `composer.json` (`scripts.post-autoload-dump`, etc.) rodam em eventos do Composer.",
					descriptionTone: "default",
					code: "composer dump-autoload\ncomposer dump-autoload -o",
					codeLanguage: "shell",
					tags: [
						"php",
						"composer",
						"dump-autoload",
						"otimizado",
						"classmap",
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
					title: "Versionamento de composer.lock e vendor no Git",
					kicker: "Aplicações vs bibliotecas",
					description:
						"Em **aplicações** (sites, APIs), faça commit de `composer.lock` para todos instalarem as mesmas versões. Em **bibliotecas** open source, o lock costuma ser ignorado. Nunca edite manualmente ficheiros dentro de `vendor/`; altere versões via `composer require` ou `composer update` com critério.",
					descriptionTone: "default",
					code: "# Commit típico em uma API PHP\ngit add composer.json composer.lock\n# Não commitar vendor/ se o pipeline faz composer install\necho \"vendor/\" >> .gitignore",
					codeLanguage: "shell",
					tags: [
						"php",
						"composer-lock",
						"git",
						"vendor",
						"boas-praticas",
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
					title: "Namespace ou caminho de ficheiro fora do PSR-4",
					kicker: "Class not found após autoload",
					description:
						"Erros frequentes: namespace no PHP não bate com o diretório; nome da classe diferente do nome do ficheiro; esquecer `composer dump-autoload` após mudar `composer.json`. O Composer não adivinha pastas: o mapeamento tem de ser explícito.",
					descriptionTone: "warn",
					code: '<?php\n// Errado: ficheiro src/Modelo/pedido.php com classe "Pedido"\n// mas namespace App\\Modelo nao bate com case do ficheiro em sistemas case-sensitive.\n\n// Certo: src/Modelo/Pedido.php\n// <?php\n// namespace App\\Modelo;\n// final class Pedido { }\n\necho "Corrija o caminho ou o namespace e rode: composer dump-autoload";',
					output: "Corrija o caminho ou o namespace e rode: composer dump-autoload",
					tags: [
						"php",
						"composer",
						"erros-comuns",
						"psr-4",
						"class-not-found",
					],
					callout: {
						type: "hint",
						label: "Checklist:",
						text: "namespace = prefixo PSR-4 + caminho relativo; nome da classe = nome do ficheiro `.php`; rode dump-autoload após alterações.",
					},
				},
			],
		},
	],
};
