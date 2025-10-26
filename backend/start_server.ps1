# Start the FastAPI backend server
Write-Host "Starting FastAPI Backend Server..." -ForegroundColor Green
Write-Host "Server will be available at http://localhost:8000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

# Check if .env exists
if (-Not (Test-Path ".env")) {
    Write-Host "Warning: .env file not found. Using example.env..." -ForegroundColor Yellow
    if (Test-Path "example.env") {
        Copy-Item "example.env" ".env"
    }
}

# Start uvicorn
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

