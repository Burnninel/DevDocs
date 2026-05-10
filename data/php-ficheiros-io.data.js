window.DOC_DATA_REGISTRY = window.DOC_DATA_REGISTRY || {};
window.DOC_DATA_REGISTRY["php-ficheiros-io"] = {
	id: "php-ficheiros-io",
	title: "PHP: Ficheiros e I/O",
	subtitle:
		"Guia prático para ler e gravar ficheiros com segurança, caminhos estáveis, streams e o que fazer depois de um upload HTTP validado.",
	searchPlaceholder: "Buscar file_get_contents, fopen, path, upload ou palavra...",
	shortcutHint: "Atalho: pressione / para focar a busca.",
	codeLanguage: "php",
	defaultSectionLayout: "single",
	quickStart: {
		title: "Como testar os exemplos desta documentação",
		kicker: "PHP CLI e diretório de trabalho atual",
		description:
			"Os exemplos usam `sys_get_temp_dir()` ou ficheiros relativos ao diretório de execução. Em Windows e Linux o separador é abstraído com `DIRECTORY_SEPARATOR` quando necessário.",
		steps: [
			"Execute `php --version`.",
			"Crie `io.php` na pasta desejada e cole um exemplo.",
			"Corra `php io.php` a partir dessa pasta para caminhos relativos funcionarem como esperado.",
		],
		codeLanguage: "shell",
		code: "php --version\nphp io.php",
		callout: {
			type: "hint",
			label: "Uploads HTTP:",
			text: "validação de `$_FILES`, MIME e tamanho está na documentação `PHP: Superglobais`; aqui focamos em mover e ler no disco.",
		},
	},
	sections: [
		{
			id: "caminhos-seguros",
			name: "Caminhos e segurança",
			layout: "single",
			entries: [
				{
					title: "__DIR__, realpath e basename",
					kicker: "Nunca concatenar caminho com input cru do utilizador",
					description:
						"Use `__DIR__` para ancorar ficheiros relativos ao script atual. `realpath` normaliza `..` e ligações simbólicas; devolve `false` se o caminho não existir. `basename` remove diretórios de um nome de ficheiro. Para nomes vindos de uploads, combine com validação na doc de superglobais antes de gravar fora de uma pasta controlada.",
					descriptionTone: "warn",
					code: '<?php\n$dir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . "php-doc-io-dir";\nif (!is_dir($dir)) {\n    mkdir($dir, 0770, true);\n}\n\n$arquivo = $dir . DIRECTORY_SEPARATOR . "contagem.txt";\nfile_put_contents($arquivo, "1");\n\n$real = realpath($arquivo);\necho ($real !== false ? "ficheiro existe" : "sem caminho") . PHP_EOL;\necho "Nome: " . basename($arquivo) . PHP_EOL;\n@unlink($arquivo);\n@rmdir($dir);',
					output: "ficheiro existe\nNome: contagem.txt",
					tags: [
						"php",
						"dir",
						"realpath",
						"basename",
						"path",
						"seguranca",
					],
					callout: {
						type: "danger",
						label: "Crítico:",
						text: "evite `include $_GET[\"p\"]` ou gravar em caminhos construídos só com input HTTP; isso abre caminho para directory traversal.",
					},
				},
			],
		},
		{
			id: "ler-escrever-simples",
			name: "file_get_contents e file_put_contents",
			layout: "single",
			entries: [
				{
					title: "Ler e escrever ficheiros pequenos de uma vez",
					kicker: "Simples para config, cache pequeno e templates",
					description:
						"`file_get_contents` lê o ficheiro inteiro para memória. `file_put_contents` grava string de uma vez; a flag `FILE_APPEND` adiciona ao fim em vez de truncar. Para ficheiros grandes ou leitura linha a linha prefira `fopen`/`fgets`.",
					descriptionTone: "default",
					code: '<?php\n$f = sys_get_temp_dir() . DIRECTORY_SEPARATOR . "php-doc-io-demo.txt";\n\nfile_put_contents($f, "primeira linha\\n");\nfile_put_contents($f, "segunda linha\\n", FILE_APPEND);\n\n$conteudo = file_get_contents($f);\necho $conteudo;\n@unlink($f);',
					output: "primeira linha\nsegunda linha\n",
					tags: [
						"php",
						"file_get_contents",
						"file_put_contents",
						"append",
						"io",
					],
				},
			],
		},
		{
			id: "fopen-streams",
			name: "fopen, fread e fecho",
			layout: "single",
			entries: [
				{
					title: "Modos r, w, a e lock exclusivo",
					kicker: "Streams dão controlo fino e leitura parcial",
					description:
						"`fopen` com `rb` lê em binário (evita surpresas de newline em Windows). `LOCK_EX` com `file_put_contents` ajuda em escrita concorrente simples. Sempre `fclose` em `finally` ou deixe o PHP fechar ao fim do script, mas fechar cedo liberta locks.",
					descriptionTone: "default",
					code: '<?php\n$f = sys_get_temp_dir() . DIRECTORY_SEPARATOR . "php-doc-stream.txt";\nfile_put_contents($f, "abc");\n\n$h = fopen($f, "rb");\nif ($h === false) {\n    exit("falha ao abrir");\n}\n\ntry {\n    $bloco = fread($h, 2);\n    echo "lidos: {$bloco}" . PHP_EOL;\n} finally {\n    fclose($h);\n}\n\n@unlink($f);',
					output: "lidos: ab",
					tags: [
						"php",
						"fopen",
						"fread",
						"fclose",
						"lock",
					],
				},
			],
		},
		{
			id: "upload-mover",
			name: "Depois do upload HTTP",
			layout: "single",
			entries: [
				{
					title: "move_uploaded_file só após validação em $_FILES",
					kicker: "Metadados e MIME vêm na doc de Superglobais",
					description:
						"O fluxo típico é: validar `error`, `size` e tipo real com `mime_content_type` na entrada `$_FILES` (ver `PHP: Superglobais`). Só então use `move_uploaded_file` para sair de `tmp_name` e ir para uma pasta do projeto com nome seguro (ex.: UUID + extensão permitida).",
					descriptionTone: "default",
					code: '<?php\n// Upload real: após validar $_FILES (doc Superglobais), use:\n// move_uploaded_file($_FILES["f"]["tmp_name"], $destinoSeguro);\n\n$tmp = sys_get_temp_dir() . DIRECTORY_SEPARATOR . "origem.txt";\n$dest = sys_get_temp_dir() . DIRECTORY_SEPARATOR . "destino-movido.txt";\n@unlink($dest);\nfile_put_contents($tmp, "ok");\nrename($tmp, $dest);\necho "Ficheiro final: " . basename($dest) . PHP_EOL;\n@unlink($dest);',
					output: "Ficheiro final: destino-movido.txt",
					tags: [
						"php",
						"move_uploaded_file",
						"upload",
						"files",
						"tmp",
					],
					callout: {
						type: "hint",
						label: "Lembrete:",
						text: "`is_uploaded_file` e `move_uploaded_file` existem para impedir que um script mova ficheiros arbitrários do servidor fingindo ser upload.",
					},
				},
			],
		},
		{
			id: "csv-log",
			name: "CSV simples e log em append",
			layout: "single",
			entries: [
				{
					title: "fputcsv e linha de log com data",
					kicker: "Escrita incremental sem carregar tudo para RAM",
					description:
						"Para exportar arrays linha a linha, abra um handle com `w` e `fputcsv`. Para logs, `FILE_APPEND` ou `fopen` com modo `a` e `fwrite` com prefixo de timestamp.",
					descriptionTone: "default",
					code: '<?php\nuse DateTimeImmutable;\n\n$f = sys_get_temp_dir() . DIRECTORY_SEPARATOR . "php-doc-log.txt";\n@unlink($f);\n\n$ts = (new DateTimeImmutable("2026-05-09 15:00:00"))->format("Y-m-d H:i:s");\nfile_put_contents($f, "[{$ts}] inicio\\n", FILE_APPEND);\nfile_put_contents($f, "[{$ts}] fim\\n", FILE_APPEND);\n\necho file_get_contents($f);\n@unlink($f);',
					output: "[2026-05-09 15:00:00] inicio\n[2026-05-09 15:00:00] fim\n",
					tags: [
						"php",
						"log",
						"append",
						"csv",
						"fputcsv",
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
					title: "Permissões, dono do processo e dados sensíveis",
					kicker: "775 em diretório nem sempre é aceitável",
					description:
						"Ajuste permissões ao ambiente (servidor web costuma ter utilizador próprio). Não grave segredos em ficheiros world-readable sem necessidade. Para configuração, variáveis de ambiente ou fora do docroot são preferíveis a credenciais em PHP versionado.",
					descriptionTone: "default",
					code: '<?php\n$perm = 0660; // rw-rw---- ilustrativo; ajuste à política do servidor\n$dir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . "php-doc-perm";\nif (!is_dir($dir)) {\n    mkdir($dir, 0770, true);\n}\n$path = $dir . DIRECTORY_SEPARATOR . "segredo.txt";\nfile_put_contents($path, "token=fake", LOCK_EX);\nchmod($path, $perm);\necho "Gravado com permissão restrita." . PHP_EOL;\n@unlink($path);\n@rmdir($dir);',
					output: "Gravado com permissão restrita.",
					tags: [
						"php",
						"chmod",
						"permissoes",
						"seguranca",
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
					title: "Esquecer LOCK ou concurrent writes",
					kicker: "Corrupção de ficheiro sob carga",
					description:
						"Outro erro é assumir `file_get_contents` sempre bem-sucedido sem verificar `false`. Use operador `??` ou compare explicitamente e trate I/O como operação que pode falhar (disco cheio, permissão).",
					descriptionTone: "warn",
					code: '<?php\n$path = "/caminho/que/nao/existe/arquivo.txt";\n$dados = @file_get_contents($path);\nif ($dados === false) {\n    echo "Falha ao ler" . PHP_EOL;\n} else {\n    echo $dados;\n}',
					output: "Falha ao ler",
					tags: [
						"php",
						"erros-comuns",
						"io",
						"false",
						"lock",
					],
				},
			],
		},
	],
};
