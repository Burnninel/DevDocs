# Instrucoes Para IA

Este projeto usa uma arquitetura propria de documentacoes estaticas locais abertas via `file://`.

Antes de criar ou alterar qualquer coisa, consulte nesta ordem:

1. `codex/PROJECT_RULES.md`
2. `codex/STRUCTURE.md`
3. `codex/EXAMPLES.md`

Regras principais:

- Preserve os padroes atuais do projeto.
- Nao introduza arquitetura nova sem necessidade explicita.
- Nao invente camadas como `controllers`, `services`, `models`, `routes` ou `views` se a tarefa nao pedir isso.
- Novas documentacoes devem seguir o fluxo atual: `docs/<slug>.html` + `data/<slug>.data.js` + registro em `data/docs-manifest.data.js`.
- Reutilize os arquivos compartilhados existentes, principalmente `assets/js/docs-core.js`, `assets/js/docs-hub.js`, `assets/css/docs-theme.css` e `assets/css/docs-hub.css`.
- Ao alterar estrutura ou conteudo de docs, rode a validacao em `scripts/validate-docs.ps1`.

Se houver duvida sobre o padrao, prefira copiar o comportamento dos arquivos existentes em vez de criar uma abordagem diferente.
