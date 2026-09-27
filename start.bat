@echo off
echo Starting World Monitor Security Toolkit...
echo.
echo =======================================================
echo Backend API : http://localhost:4000
echo Frontend UI : http://localhost:5173
echo =======================================================
echo.
echo Starting server and client concurrently...

start "WM Toolkit Server" cmd /k "cd server && npm run dev"
start "WM Toolkit Client" cmd /k "cd client && npm run dev"

echo Both dev servers have been started in separate windows!
echo To stop them, close their respective command prompt windows.
