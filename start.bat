@echo off
title ForecastFusion — Hybrid AI-NWP Blending System
color 0B

echo.
echo  ╔══════════════════════════════════════════════════════════╗
echo  ║        FORECASTFUSION  v2.6-AI  — SIH26081 MoES         ║
echo  ║        Hybrid AI-NWP Multi-Model Forecast Blending       ║
echo  ╚══════════════════════════════════════════════════════════╝
echo.
echo  [*] Starting development server...
echo  [*] URL: http://localhost:5173/
echo.

cd /d "%~dp0"

:: Check if node_modules exists
if not exist "node_modules\" (
    echo  [!] node_modules not found. Running npm install first...
    echo.
    npm install
    echo.
)

:: Start the Vite dev server and open browser
start "" "http://localhost:5173/"
npm run dev

pause
