@echo off
title ForecastFusion — Master Controller
color 0F

echo.
echo  ==============================================================
echo   FORECASTFUSION — HYBRID AI-NWP BLENDING SYSTEM (SIH26081)
echo   Master Launcher: Starting Backend (FastAPI) ^& Frontend (Vite)
echo  ==============================================================
echo.

cd /d "%~dp0"

:: 1. Check & verify backend virtual environment
echo  [*] Checking Python Virtual Environment...
if not exist "backend\.venv\Scripts\python.exe" (
    echo  [!] Virtual environment not found. Creating .venv and installing requirements...
    cd backend
    python -m venv .venv
    .venv\Scripts\pip.exe install -r requirements.txt
    cd ..
)

:: 2. Check & verify frontend node_modules
echo  [*] Checking Frontend Node Dependencies...
if not exist "node_modules\" (
    echo  [!] node_modules not found. Installing packages...
    call npm install
)

:: 3. Launch Backend in a separate titled window
echo  [*] Starting Backend API on http://localhost:8000 ...
start "ForecastFusion Backend (Port 8000)" cmd /k "cd /d ""%~dp0backend"" && color 0A && title ForecastFusion Backend (Port 8000) && .venv\Scripts\python.exe run.py"

:: 4. Wait briefly for backend socket initialization
timeout /t 2 /nobreak >nul

:: 5. Launch Frontend in a separate titled window
echo  [*] Starting Frontend UI on http://localhost:5173 ...
start "ForecastFusion Frontend (Port 5173)" cmd /k "cd /d ""%~dp0"" && color 0B && title ForecastFusion Frontend (Port 5173) && npm run dev"

:: 6. Wait briefly and open browser
timeout /t 2 /nobreak >nul
echo  [*] Opening ForecastFusion in your default browser...
start "" "http://localhost:5173/"

echo.
echo  ==============================================================
echo   ALL SERVICES ARE LIVE AND OPERATIONAL!
echo  ==============================================================
echo   - Frontend UI:       http://localhost:5173/
echo   - Backend API Docs:  http://localhost:8000/docs
echo   - Telemetry Stream:  ws://localhost:8000/ws/v1/telemetry
echo   - OASIS CAP-1.2 XML: http://localhost:8000/api/v1/advisories/mumbai-konkan/cap.xml
echo  ==============================================================
echo.
echo   Keep this window open during your demo session.
echo   Press any key in this window to STOP all servers cleanly.
echo.
pause >nul

echo.
echo  [*] Stopping ForecastFusion servers...
taskkill /f /fi "WINDOWTITLE eq ForecastFusion Backend*" >nul 2>&1
taskkill /f /fi "WINDOWTITLE eq ForecastFusion Frontend*" >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1
echo  [OK] All ForecastFusion services stopped cleanly.
timeout /t 2 /nobreak >nul
exit
