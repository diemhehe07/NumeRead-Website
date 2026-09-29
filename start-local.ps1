param(
  [int]$Port = 8000,
  [string]$HostAddress = "127.0.0.1"
)

# 1. Prioritize the in-repository backend path
$inRepoApi = Join-Path $PSScriptRoot "ml_backend\numeread api"
$legacyApi = "C:\Users\ADMIN\Desktop\numereadai\numeread api"

if (Test-Path -LiteralPath $inRepoApi) {
  $apiRoot = $inRepoApi
} elseif (Test-Path -LiteralPath $legacyApi) {
  $apiRoot = $legacyApi
} else {
  throw "NumeRead API directory not found at $inRepoApi"
}

# 2. Locate Python executable (venv or system)
$venvPython = Join-Path $apiRoot "venv\Scripts\python.exe"
$unixVenvPython = Join-Path $apiRoot "venv\bin\python"

if (Test-Path -LiteralPath $venvPython) {
  $python = $venvPython
} elseif (Test-Path -LiteralPath $unixVenvPython) {
  $python = $unixVenvPython
} else {
  $systemPython = Get-Command python -ErrorAction SilentlyContinue
  if ($systemPython) {
    $python = $systemPython.Source
  } else {
    throw "Python was not found in $venvPython or system PATH."
  }
}

$websiteRoot = Join-Path $PSScriptRoot "public"
$scriptPath = Join-Path $apiRoot "scripts\run_platform.py"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       Starting NumeRead Combined Frontend & API          " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Backend:  $apiRoot"
Write-Host " Python:   $python"
Write-Host " Web Root: $websiteRoot"
Write-Host " URL:      http://$HostAddress`:$Port"
Write-Host " API Docs: http://$HostAddress`:$Port/docs"
Write-Host " Health:   http://$HostAddress`:$Port/health"
Write-Host "==========================================================" -ForegroundColor Cyan

& $python $scriptPath --host $HostAddress --port $Port --web-root $websiteRoot

