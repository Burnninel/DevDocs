$ErrorActionPreference = "Stop"

$validatorPath = Join-Path $PSScriptRoot "validate-docs.js"

if (-not (Test-Path $validatorPath)) {
  throw "Validador não encontrado: $validatorPath"
}

$nodeCommand = Get-Command node -ErrorAction SilentlyContinue

if (-not $nodeCommand) {
  throw "Node.js não encontrado no PATH. Instale o Node.js para rodar a validação."
}

& $nodeCommand.Source $validatorPath
exit $LASTEXITCODE
