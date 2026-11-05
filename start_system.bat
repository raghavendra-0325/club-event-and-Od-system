@echo off
title Campus Club Event & OD Approval System
echo ===================================================
echo   Starting Campus Club Event & OD Approval System
echo ===================================================
echo.

REM 1. Start Backend Server (Port 3000)
cd /d "%~dp0"
echo Starting Backend Server on http://localhost:3000...
start "Backend Server (Port 3000)" cmd /k "node index.js"

REM 2. Start Frontend App (Port 5173)
cd /d "%~dp0clubevent_frontend"
echo Starting Frontend React App on http://localhost:5173...
start "Frontend App (Port 5173)" cmd /k "npm run dev"

REM 3. Open Browser to Frontend
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo ===================================================
echo System is running!
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:3000
echo ===================================================
pause
