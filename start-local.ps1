param(
  [int]$Port = 8000
)

$apiRoot = "C:\Users\ADMIN\Desktop\numereadai\numeread api"
$python = Join-Path $apiRoot "venv\Scripts\python.exe"
$websiteRoot = Join-Path $PSScriptRoot "public"

if (-not (Test-Path -LiteralPath $python)) {
  throw "Python virtual environment was not found at $python"
}

Write-Host "Starting NumeRead website and adaptive API at http://127.0.0.1:$Port"
& $python (Join-Path $apiRoot "scripts\run_platform.py") --host 127.0.0.1 --port $Port --web-root $websiteRoot
