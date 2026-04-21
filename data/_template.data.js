window.DOC_DATA_REGISTRY = window.DOC_DATA_REGISTRY || {};
window.DOC_DATA_REGISTRY["template-doc-id"] = {
	id: "template-doc-id",
	title: "Título da Documentação",
	subtitle: "Subtítulo resumido da documentação.",
	searchPlaceholder: "Buscar comando ou palavra...",
	shortcutHint: "Atalho: pressione / para focar a busca.",
	defaultSectionLayout: "two",
	quickStart: {
		title: "Como começar rápido",
		kicker: "Pré-requisitos e primeiro teste",
		description:
			"Use este bloco para explicar setup mínimo e primeira execução da doc.",
		steps: [
			"Valide se a ferramenta principal está instalada.",
			"Crie um arquivo de exemplo e cole um snippet.",
			"Execute o comando base no terminal.",
		],
		codeLanguage: "shell",
		code: "comando --version\ncomando arquivo_exemplo.ext",
		callout: {
			type: "hint",
			label: "Dica:",
			text: "mantenha os passos curtos e objetivos para onboarding rápido.",
		},
	},
	sections: [
		{
			id: "inicio",
			name: "Início",
			layout: "two",
			entries: [
				{
					title: "Comando de exemplo",
					kicker: "Quando usar",
					description: "Descrição curta do comando.",
					descriptionTone: "default",
					code: "comando --flag",
					tags: ["exemplo", "comando", "inicio"],
					callout: {
						type: "hint",
						label: "Dica:",
						text: "pode usar `--flag` para o modo avançado.",
					},
				},
				{
					title: "Item em largura total",
					kicker: "Código longo",
					description:
						"Use span full quando o bloco de código for maior.",
					descriptionTone: "default",
					span: "full",
					code: "comando_muito_longo --com-muitas-opcoes valor1 valor2 valor3",
					tags: ["full", "codigo", "grande"],
				},
			],
		},
		{
			id: "referencia",
			name: "Referência",
			layout: "single",
			entries: [
				{
					title: "Seção em coluna única",
					kicker: "Melhor para códigos grandes",
					description:
						"Defina `layout: single` para usar 1 coluna na seção.",
					descriptionTone: "warn",
					code: "comando-unico --param",
					tags: ["single", "layout", "referencia"],
				},
			],
		},
	],
};
