@echo off
title ForecastFusion — FastAPI Production Backend
color 0A

cd /d "%~dp0\backend"

echo.
echo  ╔══════════════════════════════════════════════════════════╗
echo  ║     FORECASTFUSION BACKEND API — SIH26081 MoES Track     ║
echo  ║     FastAPI + NumPy/SciPy Bayesian Ensemble Service      ║
echo  ╚══════════════════════════════════════════════════════════╝
echo.
echo  [*] API Base URL:       http://localhost:8000
echo  [*] Interactive Docs:   http://localhost:8000/docs
echo  [*] WebSocket Stream:   ws://localhost:8000/ws/v1/telemetry
echo.

if not exist ".venv\Scripts\python.exe" (
    echo [!] Virtual environment not found. Creating one and installing requirements...
    python -m venv .venv
    .venv\Scripts\pip.exe install -r requirements.txt
)

.venv\Scripts\python.exe run.py
pause
