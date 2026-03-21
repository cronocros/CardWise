# CardWise Unified Run Script
# Usage: .\run.ps1 [-service <all|backend|frontend>]

param (
    [Parameter(Mandatory=$false)]
    [ValidateSet("all", "backend", "frontend")]
    $service = "all"
)

function Stop-PortProcess([int]$port) {
    # Skip PID 0 and system processes
    $conns = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    foreach ($conn in $conns) {
        $processId = $conn.OwningProcess
        if ($processId -gt 0) {
            try {
                $proc = Get-Process -Id $processId -ErrorAction SilentlyContinue
                if ($proc) {
                    Write-Host "Stopping process '$($proc.ProcessName)' on port $port (PID: $processId)..." -ForegroundColor Yellow
                    Stop-Process -Id $processId -Force
                }
            } catch {
                Write-Host "Could not stop process $processId. You may need Admin rights." -ForegroundColor Red
            }
        }
    }
}

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "   CardWise Manager: Starting $service... " -ForegroundColor Cyan
Write-Host "==========================================`n" -ForegroundColor Cyan

# --- BACKEND ---
if ($service -eq "all" -or $service -eq "backend") {
    Write-Host "[1] Checking Backend (Port 8080)..." -ForegroundColor Gray
    Stop-PortProcess 8080
    
    Write-Host "Starting Backend (Gradle BootRun)..." -ForegroundColor Green
    cd backend
    # Open in a new persistent window for logs
    Start-Process powershell -ArgumentList "-NoExit", "-Command", ".\gradlew.bat bootRun" -WindowStyle Normal
    cd ..
}

# --- FRONTEND ---
if ($service -eq "all" -or $service -eq "frontend") {
    Write-Host "[2] Checking Frontend (Port 3000)..." -ForegroundColor Gray
    Stop-PortProcess 3000
    
    Write-Host "Starting Frontend (Bun Dev)..." -ForegroundColor Green
    cd frontend
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "bun run dev" -WindowStyle Normal
    cd ..
}

# --- WARM UP & HEALTH CHECK ---
Write-Host "`nWarming up services... (25s)" -ForegroundColor Gray
Start-Sleep -Seconds 25

if ($service -eq "all" -or $service -eq "backend") {
    try {
        $res = Invoke-WebRequest -Uri "http://localhost:8080/v3/api-docs" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($res.StatusCode -eq 200) {
            Write-Host "[SUCCESS] Backend is ONLINE (v3/api-docs)" -ForegroundColor Green
        } else {
            Write-Host "[FAIL] Backend responded with status: $($res.StatusCode)" -ForegroundColor Red
        }
    } catch {
        Write-Host "[FAIL] Backend is NOT responding. Check the opened terminal for error logs." -ForegroundColor Red
        Write-Host "Hint: Check com.cardwise.support package for compilation errors." -ForegroundColor Yellow
    }
}

if ($service -eq "all" -or $service -eq "frontend") {
    try {
        $res = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($res.StatusCode -eq 200) {
            Write-Host "[SUCCESS] Frontend is ONLINE (localhost:3000)" -ForegroundColor Green
        } else {
            Write-Host "[FAIL] Frontend responded with status: $($res.StatusCode)" -ForegroundColor Red
        }
    } catch {
        Write-Host "[FAIL] Frontend is NOT responding. Check the opened terminal." -ForegroundColor Red
    }
}

Write-Host "`nManager tasks finished." -ForegroundColor Cyan
