@echo off
echo Starting AI Food Nutrition Analyzer...
echo.

echo Starting Backend Server...
start cmd /k "cd server && node index.js"

timeout /t 3 /nobreak > nul

echo Starting Frontend...
start cmd /k "cd client && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause
