@echo off
echo Starting Jupiter Platform...

start "Backend Server" cmd /k "cd backend && npm run start:prod"
start "Frontend Application" cmd /k "cd frontend && npm run dev"

echo Platform started! 
echo Backend running on http://localhost:3000
echo Frontend running on http://localhost:5173
echo.
echo Please wait a moment for the servers to initialize.
pause
