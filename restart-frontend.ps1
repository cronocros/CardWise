# CardWise 프론트엔드 서버 재시작 스크립트
Write-Host "🔴 기존 프론트엔드 프로세스 종료 중..." -ForegroundColor Yellow

# 3000 포트 사용 중인 프로세스 종료
$portProcess = netstat -ano | Select-String ":3000 " | Where-Object { $_ -match "LISTENING" }
if ($portProcess) {
    $pid = ($portProcess -split "\s+")[-1]
    Write-Host "  → PID $pid 종료" -ForegroundColor Red
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
}

Start-Sleep -Seconds 1

Write-Host "🟢 프론트엔드 서버 시작 중..." -ForegroundColor Green
Set-Location "$PSScriptRoot\frontend"
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal

Write-Host "✅ 프론트엔드 서버가 새 창에서 시작되었습니다. (http://localhost:3000)" -ForegroundColor Cyan
