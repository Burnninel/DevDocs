window.DOC_DATA_REGISTRY = window.DOC_DATA_REGISTRY || {};
window.DOC_DATA_REGISTRY["php-datetime"] = {
	id: "php-datetime",
	title: "PHP: Datas e horários (DateTime)",
	subtitle:
		"Guia prático para modelar instantes com DateTimeImmutable, fusos horários, formatar e comparar sem efeitos colaterais surpresa.",
	searchPlaceholder: "Buscar DateTime, timezone, format, intervalo ou palavra...",
	shortcutHint: "Atalho: pressione / para focar a busca.",
	codeLanguage: "php",
	defaultSectionLayout: "single",
	quickStart: {
		title: "Como testar os exemplos desta documentação",
		kicker: "PHP CLI com extensão date (habitualmente já incluída)",
		description:
			"Os exemplos usam `DateTimeImmutable` (PHP 5.5+). Recomenda-se PHP 8.0+ para alinhar com as outras documentações do hub.",
		steps: [
			"Execute `php --version`.",
			"Crie `datas.php` e cole um exemplo desta página.",
			"Corra com `php datas.php`.",
		],
		codeLanguage: "shell",
		code: "php --version\nphp datas.php",
		callout: {
			type: "hint",
			label: "Documentação relacionada:",
			text: "`PHP: Manipulação de Strings` para formatar texto em geral; `PHP: JSON` se gravar ISO 8601 em APIs.",
		},
	},
	sections: [
		{
			id: "datetime-immutable",
			name: "DateTimeImmutable vs DateTime",
			layout: "single",
			entries: [
				{
					title: "Prefira DateTimeImmutable em código novo",
					kicker: "Métodos que parecem só ler podem mudar DateTime",
					description:
						"`DateTime` é mutável: `modify`, `setTimezone` e outros alteram o mesmo objeto. `DateTimeImmutable` devolve **novas** instâncias, o que reduz bugs quando a mesma data é partilhada entre funções. Ambos implementam `DateTimeInterface`.",
					descriptionTone: "default",
					code: '<?php\nuse DateTime;\nuse DateTimeImmutable;\n\n$mut = new DateTime("2026-05-01 10:00:00", new DateTimeZone("Europe/Lisbon"));\n$mut->modify("+1 day");\necho $mut->format("Y-m-d H:i") . PHP_EOL;\n\n$im = new DateTimeImmutable("2026-05-01 10:00:00", new DateTimeZone("Europe/Lisbon"));\n$outro = $im->modify("+1 day");\necho "original: " . $im->format("Y-m-d") . " | novo: " . $outro->format("Y-m-d") . PHP_EOL;',
					output: "2026-05-02 10:00\noriginal: 2026-05-01 | novo: 2026-05-02",
					tags: [
						"php",
						"datetime",
						"immutable",
						"mutavel",
						"timezone",
					],
					callout: {
						type: "hint",
						label: "Regra:",
						text: "se receber `DateTimeInterface` de biblioteca externa, trate como imutável na tua lógica ou clona antes de modificar.",
					},
				},
			],
		},
		{
			id: "criar-formatar",
			name: "Criar, formatar e interpretar strings",
			layout: "single",
			entries: [
				{
					title: "format() e createFromFormat()",
					kicker: "Símbolos de data seguem o padrão do PHP",
					description:
						"`format()` produz texto para exibir ou guardar. `createFromFormat()` faz o caminho inverso quando o input tem formato fixo (ex.: `d/m/Y`). Valide sempre entradas humanas antes de confiar no parse.",
					descriptionTone: "default",
					code: '<?php\nuse DateTimeImmutable;\n\n$fixoUtc = new DateTimeImmutable("2026-05-09 14:30:00", new DateTimeZone("UTC"));\necho $fixoUtc->format(DateTimeInterface::ATOM) . PHP_EOL;\n\n$texto = "09/05/2026 14:30";\n$dt = DateTimeImmutable::createFromFormat("d/m/Y H:i", $texto, new DateTimeZone("Europe/Lisbon"));\nif ($dt === false) {\n    throw new RuntimeException("Data inválida");\n}\necho $dt->format("Y-m-d\\TH:i:sP") . PHP_EOL;',
					output: "2026-05-09T14:30:00+00:00\n2026-05-09T14:30:00+01:00",
					tags: [
						"php",
						"format",
						"createfromformat",
						"iso8601",
						"parse",
					],
				},
			],
		},
		{
			id: "timezone",
			name: "Fusos horários e UTC",
			layout: "single",
			entries: [
				{
					title: "setTimezone para exibir; UTC para armazenar",
					kicker: "Base de dados e APIs costumam usar instante em UTC",
					description:
						"Guarde instantes em UTC (ou timestamp Unix) e converta para o fuso do utilizador só na apresentação. `setTimezone` em `DateTimeImmutable` devolve novo objeto com o mesmo instante civil representado no novo fuso.",
					descriptionTone: "default",
					code: '<?php\nuse DateTimeImmutable;\n\n$utc = new DateTimeImmutable("2026-07-15 18:00:00", new DateTimeZone("UTC"));\n$lisboa = $utc->setTimezone(new DateTimeZone("Europe/Lisbon"));\n\necho "UTC: " . $utc->format("Y-m-d H:i T") . PHP_EOL;\necho "Lisboa: " . $lisboa->format("Y-m-d H:i T") . PHP_EOL;',
					output: "UTC: 2026-07-15 18:00 UTC\nLisboa: 2026-07-15 19:00 WEST",
					tags: [
						"php",
						"timezone",
						"utc",
						"settimezone",
						"fusos",
					],
					callout: {
						type: "warn",
						label: "Atenção:",
						text: "horário de verão muda offsets; nunca assuma `+01:00` fixo para Lisboa em todo o ano.",
					},
				},
			],
		},
		{
			id: "intervalos-diff",
			name: "Intervalos e diferenças",
			layout: "single",
			entries: [
				{
					title: "DateInterval e diff()",
					kicker: "Somar meses é diferente de somar 30 dias",
					description:
						"`add` e `sub` recebem `DateInterval` construído com prefixo `P` (período) e `T` (tempo do dia). `diff` calcula diferença entre dois instantes e devolve `DateInterval` com sinal acessível via `format` e propriedades.",
					descriptionTone: "default",
					code: '<?php\nuse DateInterval;\nuse DateTimeImmutable;\n\n$inicio = new DateTimeImmutable("2026-05-01");\n$fim = $inicio->add(new DateInterval("P10D"));\necho $fim->format("Y-m-d") . PHP_EOL;\n\n$a = new DateTimeImmutable("2026-05-01 08:00:00");\n$b = new DateTimeImmutable("2026-05-03 20:00:00");\n$diff = $a->diff($b);\necho $diff->days . " dias, " . $diff->h . " horas" . PHP_EOL;',
					output: "2026-05-11\n2 dias, 12 horas",
					tags: [
						"php",
						"dateinterval",
						"diff",
						"add",
						"periodo",
					],
				},
			],
		},
		{
			id: "comparar",
			name: "Comparar instantes",
			layout: "single",
			entries: [
				{
					title: "Operadores < > == com objetos",
					kicker: "DateTimeInterface suporta comparação direta em PHP 8+",
					description:
						"Em versões recentes pode comparar dois `DateTimeInterface` com `<` e `>`. Alternativa portável: converter para Unix com `getTimestamp()` e comparar inteiros.",
					descriptionTone: "default",
					code: '<?php\nuse DateTimeImmutable;\n\n$a = new DateTimeImmutable("2026-01-10");\n$b = new DateTimeImmutable("2026-06-01");\n\necho ($a < $b ? "a antes de b" : "a depois") . PHP_EOL;\necho "Δ segundos: " . ($b->getTimestamp() - $a->getTimestamp()) . PHP_EOL;',
					output: "a antes de b\nΔ segundos: 12182400",
					tags: [
						"php",
						"comparar",
						"timestamp",
						"ordem",
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
					title: "Não misturar string mágica com regra de negócio",
					kicker: "Instância no domínio; string só na fronteira",
					description:
						"Mantenha datas como `DateTimeImmutable` dentro do núcleo da aplicação e serialize para string (`format` ISO) só em persistência, JSON ou templates. Evita parse repetido e comparações com strings no formato errado.",
					descriptionTone: "default",
					code: '<?php\nuse DateTimeImmutable;\n\nfunction paraApi(DateTimeImmutable $instante): string\n{\n    return $instante->setTimezone(new DateTimeZone("UTC"))->format("Y-m-d\\TH:i:s\\Z");\n}\n\n$local = new DateTimeImmutable("2026-05-09 15:00:00", new DateTimeZone("Europe/Lisbon"));\necho paraApi($local) . PHP_EOL;',
					output: "2026-05-09T14:00:00Z",
					tags: [
						"php",
						"boas-praticas",
						"api",
						"utc",
						"iso",
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
					title: "Modificar sem guardar o retorno em Immutable",
					kicker: "$dt->modify(...) sem reassinar variável",
					description:
						"Outro erro é usar `DateTime` partilhado e `modify` em loop, alterando o mesmo objeto para todos os iterados. Com imutável, reatribua ou encadeie o resultado.",
					descriptionTone: "warn",
					code: '<?php\nuse DateTimeImmutable;\n\n$base = new DateTimeImmutable("2026-05-01");\n// Errado: descarta o novo valor\n// $base->modify("+1 day");\n\n$correto = $base->modify("+1 day");\necho $base->format("Y-m-d") . " -> " . $correto->format("Y-m-d") . PHP_EOL;',
					output: "2026-05-01 -> 2026-05-02",
					tags: [
						"php",
						"erros-comuns",
						"immutable",
						"modify",
					],
				},
			],
		},
	],
};
