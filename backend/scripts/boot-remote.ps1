Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$backendRoot = Split-Path -Parent $PSScriptRoot
$repoRoot = Split-Path -Parent $backendRoot
$secretFile = Join-Path $backendRoot ".secrets\remote-env.ps1"
$exampleFile = Join-Path $backendRoot ".secrets\remote-env.example.ps1"
$projectRefFile = Join-Path $repoRoot "supabase\.temp\project-ref"

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

    if ($entry.Value -match '<[^>]+>') {
        Write-Error "Environment variable $name in $secretFile still contains a placeholder value."
    }
}

$projectRef = $null
if (Test-Path $projectRefFile) {
    $projectRef = (Get-Content $projectRefFile -Raw).Trim()
}

$dataSourceUrl = (Get-Item "Env:SPRING_DATASOURCE_URL").Value
$username = (Get-Item "Env:SPRING_DATASOURCE_USERNAME").Value
$jwtIssuer = (Get-Item "Env:SUPABASE_JWT_ISSUER").Value

if ($dataSourceUrl -match 'pooler\.supabase\.com' -and -not [string]::IsNullOrWhiteSpace($projectRef)) {
    $expectedUsername = "postgres.$projectRef"
    if ($username -ne $expectedUsername) {
        Write-Error "Pooler username mismatch. Expected SPRING_DATASOURCE_USERNAME=$expectedUsername for project $projectRef."
    }
}

if (-not [string]::IsNullOrWhiteSpace($projectRef)) {
    $expectedIssuer = "https://$projectRef.supabase.co/auth/v1"
    if ($jwtIssuer -ne $expectedIssuer) {
        Write-Error "SUPABASE_JWT_ISSUER mismatch. Expected $expectedIssuer for project $projectRef."
    }
}

Set-Location $backendRoot

& .\gradlew.bat --stop
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

& .\gradlew.bat bootRun
exit $LASTEXITCODE
