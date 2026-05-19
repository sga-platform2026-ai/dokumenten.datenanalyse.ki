# Push nach sga-platform2026-ai/dokumenten.datenanalyse.ki
# Einmal in PowerShell ausführen (interaktiv – Browser-Login erforderlich)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

Write-Host "=== GitHub Push: sga-platform2026-ai/dokumenten.datenanalyse.ki ===" -ForegroundColor Cyan
Write-Host ""

# Remote prüfen
$remoteUrl = git remote get-url origin 2>$null
if ($remoteUrl -notmatch "sga-platform2026-ai/dokumenten.datenanalyse.ki") {
    git remote remove origin 2>$null
    git remote add origin https://github.com/sga-platform2026-ai/dokumenten.datenanalyse.ki.git
}

Write-Host "Remote: $(git remote get-url origin)" -ForegroundColor Gray
Write-Host ""

# GitHub-Anmeldung (mit Konto, das Org-Zugriff hat – NICHT bpossenig-cyber)
Write-Host "Schritt 1: GitHub anmelden (Browser öffnet sich)" -ForegroundColor Yellow
Write-Host "  -> Mit dem Konto einloggen, das Schreibrecht auf sga-platform2026-ai hat." -ForegroundColor Yellow
Write-Host ""

gh auth status 2>$null
if ($LASTEXITCODE -ne 0) {
    gh auth login --hostname github.com --git-protocol https --web
} else {
    $status = gh auth status 2>&1 | Out-String
    if ($status -match "bpossenig-cyber") {
        Write-Host "Achtung: Noch als bpossenig-cyber angemeldet." -ForegroundColor Red
        $logout = Read-Host "Abmelden und neu anmelden? (j/n)"
        if ($logout -eq "j") {
            gh auth logout -h github.com
            gh auth login --hostname github.com --git-protocol https --web
        }
    }
}

Write-Host ""
Write-Host "Schritt 2: Push nach origin/main" -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Erfolg! Repository:" -ForegroundColor Green
    Write-Host "  https://github.com/sga-platform2026-ai/dokumenten.datenanalyse.ki" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Push fehlgeschlagen. Bitte Org-Admin um Write-Recht auf das Repo bitten." -ForegroundColor Red
    exit 1
}
