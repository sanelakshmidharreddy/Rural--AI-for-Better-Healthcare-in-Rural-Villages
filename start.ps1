$ErrorActionPreference = "Stop"

$backendProcess = $null
$frontendProcess = $null

try {
    $python = Join-Path $PSScriptRoot "venv\Scripts\python.exe"

    if (-not (Test-Path $python)) {
        throw "Virtual environment not found at $python. Create it and install backend\requirements.txt first."
    }

    $backendProcess = Start-Process `
        -FilePath $python `
        -ArgumentList "-m", "uvicorn", "backend.main:app", "--host", "127.0.0.1", "--port", "8000" `
        -WorkingDirectory $PSScriptRoot `
        -PassThru

    $frontendProcess = Start-Process `
        -FilePath "npm.cmd" `
        -ArgumentList "run", "dev" `
        -WorkingDirectory (Join-Path $PSScriptRoot "frontend") `
        -PassThru

    Write-Host "Backend:  http://127.0.0.1:8000"
    Write-Host "Frontend: http://localhost:3000"
    Write-Host "Press Ctrl+C to stop both servers."

    Wait-Process -Id $backendProcess.Id, $frontendProcess.Id
}
finally {
    foreach ($process in @($backendProcess, $frontendProcess)) {
        if ($null -ne $process -and -not $process.HasExited) {
            Stop-Process -Id $process.Id -Force
        }
    }
}