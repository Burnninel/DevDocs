$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$dataDir = Join-Path $root "data"

if (-not (Test-Path $dataDir)) {
  throw "Diretório 'data' não encontrado: $dataDir"
}

$files = Get-ChildItem -Path $dataDir -Filter "*.data.js" -File |
  Where-Object { $_.Name -ne "docs-manifest.data.js" -and -not $_.BaseName.StartsWith("_") }

if (-not $files) {
  Write-Host "Nenhum data file encontrado para validar." -ForegroundColor Yellow
  exit 0
}

$errors = @()

foreach ($file in $files) {
  $content = Get-Content -Raw -Path $file.FullName
  $match = [regex]::Match($content, 'window\.DOC_DATA_REGISTRY\["(?<id>[^"]+)"\]\s*=\s*(?<json>\{[\s\S]*\});')

  if (-not $match.Success) {
    $errors += "[$($file.Name)] formato inválido: esperado window.DOC_DATA_REGISTRY[`"id`"] = {...};"
    continue
  }

  $registryId = $match.Groups["id"].Value
  $json = $match.Groups["json"].Value

  try {
    $doc = $json | ConvertFrom-Json
  } catch {
    $errors += "[$($file.Name)] JSON inválido: $($_.Exception.Message)"
    continue
  }

  if (-not $doc.id) { $errors += "[$($file.Name)] campo obrigatório ausente: id" }
  if (-not $doc.title) { $errors += "[$($file.Name)] campo obrigatório ausente: title" }
  if (-not $doc.subtitle) { $errors += "[$($file.Name)] campo obrigatório ausente: subtitle" }
  if (-not $doc.searchPlaceholder) { $errors += "[$($file.Name)] campo obrigatório ausente: searchPlaceholder" }
  if (-not $doc.shortcutHint) { $errors += "[$($file.Name)] campo obrigatório ausente: shortcutHint" }
  if (-not $doc.sections) { $errors += "[$($file.Name)] campo obrigatório ausente: sections" }

  if ($doc.id -and $registryId -and $doc.id -ne $registryId) {
    $errors += "[$($file.Name)] doc.id ($($doc.id)) diferente do id do registry ($registryId)."
  }

  if ($doc.defaultSectionLayout -and @("single", "two") -notcontains $doc.defaultSectionLayout) {
    $errors += "[$($file.Name)] defaultSectionLayout inválido: $($doc.defaultSectionLayout). Use single/two."
  }

  if ($doc.quickStart) {
    if (-not $doc.quickStart.title) {
      $errors += "[$($file.Name)] quickStart sem title."
    }
    if (-not $doc.quickStart.description) {
      $errors += "[$($file.Name)] quickStart sem description."
    }
    if ($doc.quickStart.steps -and @($doc.quickStart.steps).Count -eq 0) {
      $errors += "[$($file.Name)] quickStart com steps vazio."
    }

    if ($doc.quickStart.callout) {
      if (@("hint", "warn", "danger") -notcontains $doc.quickStart.callout.type) {
        $errors += "[$($file.Name)] quickStart.callout.type inválido."
      }
      if (-not $doc.quickStart.callout.label) {
        $errors += "[$($file.Name)] quickStart.callout sem label."
      }
      if (-not $doc.quickStart.callout.text) {
        $errors += "[$($file.Name)] quickStart.callout sem text."
      }
    }
  }

  $sectionIds = @{}
  foreach ($section in @($doc.sections)) {
    if (-not $section.id) {
      $errors += "[$($file.Name)] seção sem id."
      continue
    }
    if (-not $section.name) {
      $errors += "[$($file.Name)] seção '$($section.id)' sem name."
    }
    if ($sectionIds.ContainsKey($section.id)) {
      $errors += "[$($file.Name)] id de seção duplicado: $($section.id)."
    } else {
      $sectionIds[$section.id] = $true
    }

    if ($section.layout -and @("single", "two") -notcontains $section.layout) {
      $errors += "[$($file.Name)] seção '$($section.id)' com layout inválido: $($section.layout)."
    }

    foreach ($entry in @($section.entries)) {
      if (-not $entry.title) { $errors += "[$($file.Name)] seção '$($section.id)' possui item sem title." }
      if (-not $entry.kicker) { $errors += "[$($file.Name)] seção '$($section.id)' possui item sem kicker." }
      if (-not $entry.description) { $errors += "[$($file.Name)] seção '$($section.id)' possui item sem description." }
      if (-not $entry.code) { $errors += "[$($file.Name)] seção '$($section.id)' possui item sem code." }
      if (-not $entry.tags -or @($entry.tags).Count -eq 0) {
        $errors += "[$($file.Name)] seção '$($section.id)' possui item sem tags."
      }

      if ($entry.descriptionTone -and @("default", "warn") -notcontains $entry.descriptionTone) {
        $errors += "[$($file.Name)] seção '$($section.id)' item '$($entry.title)' com descriptionTone inválido."
      }

      if ($entry.span -and @("full") -notcontains $entry.span) {
        $errors += "[$($file.Name)] seção '$($section.id)' item '$($entry.title)' com span inválido."
      }

      if ($entry.callout) {
        if (@("hint", "warn", "danger") -notcontains $entry.callout.type) {
          $errors += "[$($file.Name)] seção '$($section.id)' item '$($entry.title)' com callout.type inválido."
        }
        if (-not $entry.callout.label) {
          $errors += "[$($file.Name)] seção '$($section.id)' item '$($entry.title)' com callout sem label."
        }
        if (-not $entry.callout.text) {
          $errors += "[$($file.Name)] seção '$($section.id)' item '$($entry.title)' com callout sem text."
        }
      }
    }
  }
}

if ($errors.Count -gt 0) {
  Write-Host "Falhas de validação encontradas:" -ForegroundColor Red
  $errors | ForEach-Object { Write-Host " - $_" -ForegroundColor Red }
  exit 1
}

Write-Host "Validação concluída com sucesso para $($files.Count) arquivo(s)." -ForegroundColor Green

