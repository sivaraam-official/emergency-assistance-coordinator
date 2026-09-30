@echo off
setlocal
title Emergency Assistance Coordinator - Launcher
cd /d "%~dp0"

echo ==================================================
echo   Emergency Assistance Coordinator - one-click run
echo ==================================================

where java >nul 2>&1 || (echo [ERROR] Java 17+ was not found. Install a JDK and try again. & pause & exit /b 1)
where mvn  >nul 2>&1 || (echo [ERROR] Maven was not found. Install Maven 3.9+ and try again. & pause & exit /b 1)
where npm  >nul 2>&1 || (echo [ERROR] Node.js / npm was not found. Install Node 18+ and try again. & pause & exit /b 1)

if not exist "frontend\node_modules" (
  echo.
  echo First run: installing frontend packages, please wait...
  pushd frontend
  call npm install
  if errorlevel 1 (echo [ERROR] npm install failed. & popd & pause & exit /b 1)
  popd
)

echo.
echo Starting backend  on http://localhost:8080 ...
start "EAC Backend (port 8080)" /d "%~dp0backend" cmd /k mvn spring-boot:run

echo Starting frontend on http://localhost:5173 ...
start "EAC Frontend (port 5173)" /d "%~dp0frontend" cmd /k npm run dev

echo.
echo Waiting for the servers to start, then opening your browser...
timeout /t 20 /nobreak >nul
start "" http://localhost:5173

echo.
echo Done. To stop the app, close the two server windows (or press Ctrl+C in each).
endlocal
