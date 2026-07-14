Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$requiredFiles = @(
    "AGENTS.md",
    "CONTEXT.md",
    "HYPER_PROMPT.md",
    ".agents/rules/cies-project.md",
    ".agents/workflows/cies-bootstrap.md",
    ".agents/workflows/cies-build.md",
    ".agents/workflows/cies-feature.md",
    ".agents/workflows/cies-firebase-audit.md",
    ".agents/workflows/cies-release-candidate.md",
    ".agents/workflows/cies-resume.md",
    ".agents/workflows/cies-review.md",
    ".agents/workflows/cies-sync-context.md",
    "docs/ai/SKILL_BUNDLE_CIES.md",
    "docs/ai/FIREBASE_ARCHITECTURE_BASELINE.md",
    "docs/ai/FIREBASE_MIGRATION_NOTES.md"
)

Write-Host "Verificando CIES Hyper Prompt Pack..." -ForegroundColor Cyan

$missing = @()
foreach ($file in $requiredFiles) {
    if (-not (Test-Path -LiteralPath $file)) {
        $missing += $file
        Write-Host "[FALTA] $file" -ForegroundColor Red
    } else {
        Write-Host "[OK] $file" -ForegroundColor Green
    }
}

if ($missing.Count -gt 0) {
    throw "Pacote incompleto. Arquivos ausentes: $($missing -join ', ')"
}

$workflowFiles = Get-ChildItem -Path ".agents/workflows" -Filter "*.md" -File
foreach ($workflow in $workflowFiles) {
    $content = Get-Content -LiteralPath $workflow.FullName -Raw
    if (-not $content.StartsWith("---")) {
        throw "Workflow sem frontmatter YAML: $($workflow.FullName)"
    }
    if ($content -notmatch "description:") {
        throw "Workflow sem description: $($workflow.FullName)"
    }
}

if (Test-Path -LiteralPath ".agents/skills") {
    $skills = Get-ChildItem -Path ".agents/skills" -Filter "SKILL.md" -File -Recurse -ErrorAction SilentlyContinue
    Write-Host "Skills locais detectadas: $($skills.Count)" -ForegroundColor Yellow
} else {
    Write-Host "Pasta .agents/skills ainda não existe. As skills podem estar instaladas globalmente; confirme no Antigravity." -ForegroundColor Yellow
}

if (Test-Path -LiteralPath ".git") {
    Write-Host "Repositório Git detectado." -ForegroundColor Green
    git status --short
} else {
    Write-Host "Aviso: execute na raiz do repositório Git." -ForegroundColor Yellow
}



$forbiddenPatterns = @(
    "supabase",
    "postgresql",
    "nextjs-supabase-auth",
    "supabase-postgres-best-practices",
    "políticas RLS"
)

$filesToScan = @(
    "AGENTS.md",
    "CONTEXT.md",
    "HYPER_PROMPT.md",
    "docs/ai/SKILL_BUNDLE_CIES.md",
    "docs/ai/FIREBASE_ARCHITECTURE_BASELINE.md",
    "docs/ai/FIREBASE_MIGRATION_NOTES.md"
) + (Get-ChildItem -Path ".agents/workflows" -Filter "*.md" -File | ForEach-Object { $_.FullName })

foreach ($pattern in $forbiddenPatterns) {
    foreach ($file in $filesToScan) {
        $content = Get-Content -LiteralPath $file -Raw
        if ($content -match [regex]::Escape($pattern)) {
            throw "Referência incompatível com Firebase encontrada em '$file': $pattern"
        }
    }
}

Write-Host "Verificação Firebase: nenhuma referência Supabase/PostgreSQL incompatível encontrada." -ForegroundColor Green

Write-Host "Pacote Firebase validado com sucesso." -ForegroundColor Cyan
