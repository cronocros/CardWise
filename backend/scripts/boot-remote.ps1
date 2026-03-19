Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$backendRoot = Split-Path -Parent $PSScriptRoot
$secretFile = Join-Path $backendRoot ".secrets\remote-env.ps1"
$exampleFile = Join-Path $backendRoot ".secrets\remote-env.example.ps1"

if (-not (Test-Path $secretFile)) {
    Write-Error "Missing $secretFile. Copy $exampleFile to remote-env.ps1 and fill in the real values."
}

. $secretFile

$requiredEnvVars = @(
    "SPRING_DATASOURCE_URL",
    "SPRING_DATASOURCE_USERNAME",
    "SPRING_DATASOURCE_PASSWORD",
    "SUPABASE_JWT_ISSUER"
)

foreach ($name in $requiredEnvVars) {
    $entry = Get-Item "Env:$name" -ErrorAction SilentlyContinue
    if ($null -eq $entry -or [string]::IsNullOrWhiteSpace($entry.Value)) {
        Write-Error "Environment variable $name is not set by $secretFile."
    }
}

Set-Location $backendRoot

& .\gradlew.bat --stop
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

& .\gradlew.bat bootRun
exit $LASTEXITCODE
