# CardWise 백엔드 서버 재시작 스크립트
Write-Host "========================================"
Write-Host "  CardWise 백엔드 서버 재시작"
Write-Host "========================================"

Write-Host "`n기존 8080 포트 프로세스 종료 중..."

$portLine = netstat -ano | Select-String ":8080 " | Where-Object { $_ -match "LISTENING" }
if ($portLine) {
    $procId = ($portLine.ToString().Trim() -split "\s+")[-1]
    Write-Host "PID $procId 종료"
    Stop-Process -Id ([int]$procId) -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
} else {
    Write-Host "8080 포트 사용 중인 프로세스 없음"
}

Write-Host "`n백엔드 서버 시작 중..."
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\backend'; .\gradlew.bat bootRun" -WindowStyle Normal

Write-Host "`n서버 시작 완료!"
Write-Host "API: http://localhost:8080"
Write-Host "Swagger: http://localhost:8080/swagger-ui/index.html"
