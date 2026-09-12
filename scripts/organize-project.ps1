# Script PowerShell para criar e organizar a estrutura do projeto
# Nota: Nenhum conteúdo é escrito nos arquivos novos; arquivos existentes são mantidos intactos.

$ErrorActionPreference = "Stop"

$RootDir = Split-Path -Parent $PSScriptRoot
$SrcDir = Join-Path $RootDir "src"

$directories = @(
    # App routes - (auth)
    (Join-Path $SrcDir "app\(auth)\login"),
    (Join-Path $SrcDir "app\(auth)\registo"),
    (Join-Path $SrcDir "app\(auth)\recuperar-senha"),

    # App routes - (dashboard)
    (Join-Path $SrcDir "app\(dashboard)\dashboard"),
    (Join-Path $SrcDir "app\(dashboard)\utilizadores\[id]"),
    (Join-Path $SrcDir "app\(dashboard)\parcelas\novo"),
    (Join-Path $SrcDir "app\(dashboard)\parcelas\[id]"),
    (Join-Path $SrcDir "app\(dashboard)\leituras\nova"),
    (Join-Path $SrcDir "app\(dashboard)\leituras\historico"),
    (Join-Path $SrcDir "app\(dashboard)\culturas\recomendacoes"),
    (Join-Path $SrcDir "app\(dashboard)\pragas\ocorrencias"),
    (Join-Path $SrcDir "app\(dashboard)\mensagens\alertas"),

    # Features
    (Join-Path $SrcDir "features\auth\components"),
    (Join-Path $SrcDir "features\auth\hooks"),
    (Join-Path $SrcDir "features\auth\services"),
    (Join-Path $SrcDir "features\auth\schemas"),

    (Join-Path $SrcDir "features\users\components"),
    (Join-Path $SrcDir "features\users\hooks"),
    (Join-Path $SrcDir "features\users\services"),

    (Join-Path $SrcDir "features\parcelas\components"),
    (Join-Path $SrcDir "features\parcelas\hooks"),
    (Join-Path $SrcDir "features\parcelas\services"),

    (Join-Path $SrcDir "features\leituras\components"),
    (Join-Path $SrcDir "features\leituras\hooks"),
    (Join-Path $SrcDir "features\leituras\services"),

    (Join-Path $SrcDir "features\culturas\components"),
    (Join-Path $SrcDir "features\culturas\hooks"),
    (Join-Path $SrcDir "features\culturas\services"),

    (Join-Path $SrcDir "features\pragas\components"),
    (Join-Path $SrcDir "features\pragas\hooks"),
    (Join-Path $SrcDir "features\pragas\services"),

    (Join-Path $SrcDir "features\comunicacao\components"),
    (Join-Path $SrcDir "features\comunicacao\hooks"),
    (Join-Path $SrcDir "features\comunicacao\services"),

    # Lib infrastructure
    (Join-Path $SrcDir "lib\api"),
    (Join-Path $SrcDir "lib\auth"),
    (Join-Path $SrcDir "lib\rbac"),

    # Types & Utils
    (Join-Path $SrcDir "types"),
    (Join-Path $SrcDir "utils")
)

$emptyFiles = @(
    # App routes - (auth)
    (Join-Path $SrcDir "app\(auth)\login\page.tsx"),
    (Join-Path $SrcDir "app\(auth)\registo\page.tsx"),
    (Join-Path $SrcDir "app\(auth)\recuperar-senha\page.tsx"),

    # App routes - (dashboard)
    (Join-Path $SrcDir "app\(dashboard)\utilizadores\page.tsx"),
    (Join-Path $SrcDir "app\(dashboard)\utilizadores\[id]\page.tsx"),
    (Join-Path $SrcDir "app\(dashboard)\parcelas\page.tsx"),
    (Join-Path $SrcDir "app\(dashboard)\parcelas\novo\page.tsx"),
    (Join-Path $SrcDir "app\(dashboard)\parcelas\[id]\page.tsx"),
    (Join-Path $SrcDir "app\(dashboard)\leituras\page.tsx"),
    (Join-Path $SrcDir "app\(dashboard)\leituras\nova\page.tsx"),
    (Join-Path $SrcDir "app\(dashboard)\leituras\historico\page.tsx"),
    (Join-Path $SrcDir "app\(dashboard)\culturas\page.tsx"),
    (Join-Path $SrcDir "app\(dashboard)\culturas\recomendacoes\page.tsx"),
    (Join-Path $SrcDir "app\(dashboard)\pragas\page.tsx"),
    (Join-Path $SrcDir "app\(dashboard)\pragas\ocorrencias\page.tsx"),
    (Join-Path $SrcDir "app\(dashboard)\mensagens\page.tsx"),
    (Join-Path $SrcDir "app\(dashboard)\mensagens\alertas\page.tsx"),

    # Feature types
    (Join-Path $SrcDir "features\auth\types.ts"),
    (Join-Path $SrcDir "features\users\types.ts"),
    (Join-Path $SrcDir "features\parcelas\types.ts"),
    (Join-Path $SrcDir "features\leituras\types.ts"),
    (Join-Path $SrcDir "features\culturas\types.ts"),
    (Join-Path $SrcDir "features\pragas\types.ts"),
    (Join-Path $SrcDir "features\comunicacao\types.ts"),

    # Lib infrastructure
    (Join-Path $SrcDir "lib\api\client.ts"),
    (Join-Path $SrcDir "lib\api\endpoints.ts"),
    (Join-Path $SrcDir "lib\auth\jwt.ts"),
    (Join-Path $SrcDir "lib\auth\session.ts"),
    (Join-Path $SrcDir "lib\rbac\permissions.ts"),

    # Global types & middleware
    (Join-Path $SrcDir "types\roles.ts"),
    (Join-Path $SrcDir "middleware.ts")
)

Write-Host "🚀 Iniciando organização do projeto..." -ForegroundColor Cyan

# 1. Criação de pastas
foreach ($dir in $directories) {
    if (-not (Test-Path -LiteralPath $dir)) {
        New-Item -ItemType Directory -LiteralPath $dir -Force | Out-Null
        Write-Host "[DIR] Criado: $dir" -ForegroundColor Green
    }
}

# 2. Mover dashboard existente para (dashboard)/dashboard
$oldDashboardPage = Join-Path $SrcDir "app\dashboard\page.tsx"
$newDashboardDir  = Join-Path $SrcDir "app\(dashboard)\dashboard"
$newDashboardPage = Join-Path $newDashboardDir "page.tsx"

if ((Test-Path -LiteralPath $oldDashboardPage) -and -not (Test-Path -LiteralPath $newDashboardPage)) {
    if (-not (Test-Path -LiteralPath $newDashboardDir)) {
        New-Item -ItemType Directory -LiteralPath $newDashboardDir -Force | Out-Null
    }
    Move-Item -LiteralPath $oldDashboardPage -Destination $newDashboardPage
    Write-Host "[MOVE] Movido com sucesso: src/app/dashboard/page.tsx -> src/app/(dashboard)/dashboard/page.tsx" -ForegroundColor Yellow

    $oldDashboardDir = Join-Path $SrcDir "app\dashboard"
    if ((Test-Path -LiteralPath $oldDashboardDir) -and (Get-ChildItem -LiteralPath $oldDashboardDir).Count -eq 0) {
        Remove-Item -LiteralPath $oldDashboardDir -Force
        Write-Host "[CLEANUP] Removida pasta antiga vazia: src/app/dashboard" -ForegroundColor Gray
    }
}

# 3. Criação de arquivos vazios
foreach ($file in $emptyFiles) {
    if (-not (Test-Path -LiteralPath $file)) {
        $parent = Split-Path -Parent $file
        if (-not (Test-Path -LiteralPath $parent)) {
            New-Item -ItemType Directory -LiteralPath $parent -Force | Out-Null
        }
        New-Item -ItemType File -LiteralPath $file -Force | Out-Null
        Write-Host "[FILE] Criado (vazio): $file" -ForegroundColor Green
    } else {
        Write-Host "[SKIP] Arquivo já existe, mantido intacto: $file" -ForegroundColor DarkGray
    }
}

Write-Host "`n✅ Estrutura criada e organizada com sucesso!" -ForegroundColor Cyan
