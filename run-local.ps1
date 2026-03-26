# Run Smart Campus Operations Hub locally (Windows)
# Requires: JDK 17+ on PATH and Node.js. Uses backend\mvnw.cmd (no global Maven).

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"

function Set-JavaHome {
    if ($env:JAVA_HOME -and (Test-Path "$env:JAVA_HOME\bin\java.exe")) {
        Write-Host "Using JAVA_HOME=$($env:JAVA_HOME)" -ForegroundColor Gray
        return $true
    }
    try {
        $raw = cmd /c "java -XshowSettings:properties -version 2>&1"
        foreach ($line in $raw) {
            if ($line -match '^\s*java\.home\s*=\s*(.+)\s*$') {
                $env:JAVA_HOME = $matches[1].Trim()
                Write-Host "Detected JAVA_HOME=$($env:JAVA_HOME)" -ForegroundColor Gray
                return $true
            }
        }
    } catch { }
    $java = Get-Command java -ErrorAction SilentlyContinue
    if (-not $java) { return $false }
    $bin = Split-Path $java.Source
    if ($bin -match '\\bin$') {
        $env:JAVA_HOME = Split-Path $bin
        Write-Host "Using JAVA_HOME=$($env:JAVA_HOME)" -ForegroundColor Gray
        return $true
    }
    return $false
}

if (-not (Set-JavaHome)) {
    Write-Host "Java not found. Install JDK 17+ and add java to PATH." -ForegroundColor Red
    Write-Host "https://adoptium.net/ or Oracle JDK" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path (Join-Path $frontend "node_modules"))) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
    Push-Location $frontend
    npm install
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    Pop-Location
}

$jh = $env:JAVA_HOME
Write-Host ""
Write-Host "Starting API on http://localhost:8080 (wait for 'Started CampusHubApplication')..." -ForegroundColor Cyan
Start-Process -FilePath "cmd.exe" -ArgumentList @(
    "/k",
    "set `"JAVA_HOME=$jh`" && cd /d `"$backend`" && mvnw.cmd spring-boot:run"
) -WindowStyle Normal

Start-Sleep -Seconds 2

Write-Host "Starting UI (Vite) on port 5173 ..." -ForegroundColor Cyan
Start-Process -FilePath "cmd.exe" -ArgumentList @(
    "/k",
    "cd /d `"$frontend`" && npm run dev"
) -WindowStyle Normal

Write-Host ""
Write-Host "Two windows opened." -ForegroundColor Green
Write-Host "  UI:  http://localhost:5173" -ForegroundColor White
Write-Host "  API: http://localhost:8080 (wait for Started CampusHubApplication in the API window)" -ForegroundColor White
Write-Host "Login: user@campus.edu / user123" -ForegroundColor Gray
Write-Host ""
Start-Sleep -Seconds 5
try {
    Start-Process "http://localhost:5173"
} catch { }
