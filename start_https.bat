@echo off
echo Starting HTTPS Tunnel for Jupiter Platform...
echo.

where ngrok >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Ngrok not found in your PATH.
    echo Please download Ngrok from https://ngrok.com/download
    echo After downloading, extract it and place 'ngrok.exe' in this folder or add it to your PATH.
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b
)

echo Ngrok found! Starting tunnel on port 5173...
echo.
echo Your HTTPS URL will appear in the new window.
echo Copy the "Forwarding" URL (e.g., https://xxxx-xxxx.ngrok-free.app)
echo.

ngrok http 5173
pause
