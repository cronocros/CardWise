# CardWise 전체 서버 재시작 스크립트
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CardWise 전체 서버 재시작" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 기존 프로세스 종료
Write-Host "`n🔴 기존 프로세스 종료 중..." -ForegroundColor Yellow

@(8080, 3000) | ForEach-Object {
    $port = $_
    $portLine = netstat -ano | Select-String ":$port " | Where-Object { $_ -match "LISTENING" }
    if ($portLine) {
        $procId = ($portLine -split "\s+")[-1]
        Write-Host "  → 포트 $port (PID: $procId) 종료" -ForegroundColor Red
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
    }
}

Start-Sleep -Seconds 2

# 백엔드 시작
Write-Host "`n🟢 백엔드 서버 시작 중..." -ForegroundColor Green
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\backend'; .\gradlew.bat bootRun" -WindowStyle Normal

Start-Sleep -Seconds 3

# 프론트엔드 시작
Write-Host "🟢 프론트엔드 서버 시작 중..." -ForegroundColor Green
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\frontend'; npm run dev" -WindowStyle Normal

Write-Host "`n✅ 서버 시작 완료!" -ForegroundColor Cyan
Write-Host "   프론트엔드: http://localhost:3000" -ForegroundColor White
Write-Host "   백엔드 API: http://localhost:8080" -ForegroundColor White
Write-Host "   Swagger UI: http://localhost:8080/swagger-ui/index.html" -ForegroundColor White
