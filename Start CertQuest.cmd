@echo off
cd /d "%~dp0"
docker info >nul 2>&1
if errorlevel 1 (
  echo Start Docker Desktop, wait until it is running, then open this file again.
  pause
  exit /b 1
)
docker compose up -d --build --wait
if errorlevel 1 (
  echo CertQuest could not start. See the error above.
  pause
  exit /b 1
)
if not defined CERTQUEST_PORT set CERTQUEST_PORT=8095
start "" "http://localhost:%CERTQUEST_PORT%"
