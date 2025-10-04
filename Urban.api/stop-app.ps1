# PowerShell script to stop Urban.api and all dotnet processes
# This prevents file locking issues when rebuilding

Write-Host "Stopping Urban.api processes..." -ForegroundColor Yellow

# Stop Urban.api processes
$urbanProcesses = Get-Process -Name "Urban.api" -ErrorAction SilentlyContinue
if ($urbanProcesses) {
    $urbanProcesses | ForEach-Object {
        Write-Host "Stopping Urban.api (PID: $($_.Id))" -ForegroundColor Red
        Stop-Process -Id $_.Id -Force
    }
} else {
    Write-Host "No Urban.api processes found" -ForegroundColor Green
}

# Stop all dotnet processes
$dotnetProcesses = Get-Process -Name "dotnet" -ErrorAction SilentlyContinue
if ($dotnetProcesses) {
    $dotnetProcesses | ForEach-Object {
        Write-Host "Stopping dotnet (PID: $($_.Id))" -ForegroundColor Red
        Stop-Process -Id $_.Id -Force
    }
} else {
    Write-Host "No dotnet processes found" -ForegroundColor Green
}

Write-Host "All processes stopped. You can now rebuild the project." -ForegroundColor Green
Write-Host "Run: dotnet build" -ForegroundColor Cyan
