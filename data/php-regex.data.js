window.DOC_DATA_REGISTRY = window.DOC_DATA_REGISTRY || {};
window.DOC_DATA_REGISTRY["php-regex"] = {
	id: "php-regex",
	title: "PHP: Expressões regulares (preg_*)",
	subtitle:
		"Guia prático para preg_match, preg_replace, delimitadores PCRE e quando funções de string bastam.",
	searchPlaceholder: "Buscar preg_match, preg_replace, pattern, unicode ou palavra...",
	shortcutHint: "Atalho: pressione / para focar a busca.",
	codeLanguage: "php",
	defaultSectionLayout: "single",
	quickStart: {
		title: "Como testar os exemplos desta documentação",
		kicker: "PHP com extensão PCRE",
		description:
			"Os exemplos usam funções `preg_*`. Confirme que `preg_match` existe no seu build (`php -m` lista pcre).",
		steps: [
			"Crie `regex.php` e cole um exemplo.",
			"Execute `php regex.php`.",
		],
		codeLanguage: "shell",
		code: "php regex.php",
		callout: {
			type: "hint",
			label: "Documentação relacionada:",
			text: "`PHP: Manipulação de Strings` para `str_contains`, `str_replace` e parsing simples sem regex.",
		},
	},
	sections: [
		{
			id: "quando-usar",
			name: "Quando usar regex",
			layout: "single",
			entries: [
				{
					title: "Regex é poderosa mas cara de ler e manter",
					kicker: "Prefira funções dedicadas quando existirem",
					description:
						"Use regex quando precisa de padrão flexível (validar e-mail com regras complexas, extrair tokens de texto livre, normalizar formatos). Para substring fixa, prefixo/sufixo ou substituição literal, `str_*` costuma ser mais claro e rápido.",
					descriptionTone: "default",
					code: '<?php\n$email = "ana@exemplo.com";\n\nif (filter_var($email, FILTER_VALIDATE_EMAIL)) {\n    echo "E-mail válido (filter_var, sem regex manual)." . PHP_EOL;\n}\n\nif (preg_match(\'#^[^@]+@[^@]+\\.[^@]+$#\', $email)) {\n    echo "E-mail válido (regex ilustrativa)." . PHP_EOL;\n}',
					output: "E-mail válido (filter_var, sem regex manual).\nE-mail válido (regex ilustrativa).",
					tags: [
						"php",
						"regex",
						"quando",
						"filter_var",
						"manutencao",
					],
				},
			],
		},
		{
			id: "delimitadores-modificadores",
			name: "Delimitadores e modificadores",
			layout: "single",
			entries: [
				{
					title: "Delimitador # ou / e modificador u para Unicode",
					kicker: "PCRE exige delimitadores em volta do padrão",
					description:
						"O padrão começa e termina com um delimitador escolhido (`/pat/` ou `#pat#`). Modificadores vão depois do fecho: `i` ignora maiúsculas, `m` afeta `^` e `$` por linha, `u` trata UTF-8 corretamente em caracteres acentuados.",
					descriptionTone: "default",
					code: '<?php\n$txt = "olá 123";\n\nif (preg_match(\'#^olá\\s+\\d+$#u\', $txt)) {\n    echo "Casa com acento e dígitos." . PHP_EOL;\n}',
					output: "Casa com acento e dígitos.",
					tags: [
						"php",
						"delimitador",
						"modificador",
						"unicode",
						"pcre",
					],
				},
			],
		},
		{
			id: "preg-match",
			name: "preg_match e preg_match_all",
			layout: "single",
			entries: [
				{
					title: "Capturar grupos e todas as ocorrências",
					kicker: "preg_match para primeira; preg_match_all para lista",
					description:
						"`preg_match` devolve 1 se houve correspondência e preenche `$m` com grupos. `PREG_OFFSET_CAPTURE` guarda posição. `preg_match_all` percorre todas as coincidências, útil para extrair códigos repetidos num texto.",
					descriptionTone: "default",
					code: '<?php\n$html = \'<a href="/a">x</a><a href="/b">y</a>\';\n\nif (preg_match(\'#href="([^"]+)"#\', $html, $m)) {\n    echo "Primeiro href: " . $m[1] . PHP_EOL;\n}\n\npreg_match_all(\'#href="([^"]+)"#\', $html, $todas, PREG_PATTERN_ORDER);\nprint_r($todas[1]);',
					output: "Primeiro href: /a\nArray\n(\n    [0] => /a\n    [1] => /b\n)",
					tags: [
						"php",
						"preg_match",
						"preg_match_all",
						"grupos",
						"extrair",
					],
				},
			],
		},
		{
			id: "preg-replace",
			name: "preg_replace e preg_quote",
			layout: "single",
			entries: [
				{
					title: "Substituir por padrão e escapar texto de utilizador",
					kicker: "Backreferences $1 e preg_quote para literais",
					description:
						"`preg_replace` aplica padrão a string ou array. Use `preg_quote` quando o utilizador fornece fragmento que vai dentro do padrão, para não interpretar metacaracteres como `.` ou `+` como operadores regex.",
					descriptionTone: "default",
					code: '<?php\n$usuario = "a.c";\n$seguro = preg_quote($usuario, \'#\');\n$linha = "token=a.c;outro=1";\n$nova = preg_replace(\'#\' . $seguro . \'#i\', "X", $linha);\necho $nova . PHP_EOL;\n\n$data = "2026-05-09";\necho preg_replace(\'#^(\\d{4})-(\\d{2})-(\\d{2})$#\', \'$3/$2/$1\', $data) . PHP_EOL;',
					output: "token=X;outro=1\n09/05/2026",
					tags: [
						"php",
						"preg_replace",
						"preg_quote",
						"substituir",
						"seguranca",
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
					title: "Legibilidade e custo de backtracking",
					kicker: "Padrões aninhados profundos podem explodir em tempo",
					description:
						"Quebre padrões complexos em passos ou use possessivos/atomic groups com cuidado. Documente o significado de cada grupo. Em validação crítica combine regex com validação semântica (checksum de IBAN, etc.).",
					descriptionTone: "default",
					code: '<?php\n// Em vez de um mega-padrão, duas etapas simples:\n$cod = "REF-00042-Z";\n$ok = preg_match(\'#^REF-\\d{5}-[A-Z]$#\', $cod) === 1;\necho $ok ? "formato ref ok" : "invalido";\necho PHP_EOL;',
					output: "formato ref ok",
					tags: [
						"php",
						"boas-praticas",
						"performance",
						"legibilidade",
						"regex",
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
					title: "Esquecer delimitador ou usar . sem intenção",
					kicker: "preg_match devolve 0 ou false; verifique ===",
					description:
						"Confundir `false` (erro) com `0` (sem match) quebra fluxo. Ative `preg_last_error()` em versões recentes ou valide retorno antes de usar `$m`. `.` não casa newline sem `/s`.",
					descriptionTone: "warn",
					code: '<?php\n$padrao = "sem-delimitador-final"; // inválido em preg_match real\n$r = @preg_match("#[a-z+#", "abc");\nif ($r === false) {\n    echo "padrao invalido" . PHP_EOL;\n}\n\n$r2 = preg_match(\'#^\d+$#\', "12a");\necho ($r2 === 0 ? "sem match" : "match") . PHP_EOL;',
					output: "padrao invalido\nsem match",
					tags: [
						"php",
						"erros-comuns",
						"preg_match",
						"false",
						"delimitador",
					],
				},
			],
		},
	],
};
