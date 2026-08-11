@echo off
title Iveco CRM
color 0A

echo.
echo  ================================
echo    IVECO CRM BASLATILIYOR...
echo  ================================
echo.

echo  [1/3] Backend sunucusu baslatiliyor...
cd /d "%~dp0backend"
start /b "" "C:\Users\Murat\AppData\Local\Programs\Python\Python313\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000

timeout /t 3 /nobreak >nul

echo  [2/3] Frontend baslatiliyor...
cd /d "%~dp0frontend"
start /b "" cmd /c "npm run dev"

timeout /t 3 /nobreak >nul

echo  [3/3] Tarayici aciliyor...
start "" "http://localhost:5173"

echo.
echo  ================================
echo    IVECO CRM HAZIR!
echo    http://localhost:5173
echo.
echo    Kapatmak icin bu pencereyi
echo    kapatin.
echo  ================================
echo.

:loop
timeout /t 60 /nobreak >nul
goto loop
