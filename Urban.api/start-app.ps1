# PowerShell script to start Urban.api
# This will run the application on port 5000

Write-Host "Starting Urban.api on http://localhost:5001..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the application" -ForegroundColor Yellow
Write-Host "Swagger UI will be available at: http://localhost:5001/swagger" -ForegroundColor Cyan
Write-Host ""

dotnet run --project Urban.api --urls "http://localhost:5001"
