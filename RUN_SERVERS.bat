@echo off
setlocal enabledelayedexpansion

REM Add Node.js to PATH
set PATH=C:\Program Files\nodejs;%PATH%

REM Check if node_modules exist
if not exist "c:\Users\naimu\Desktop\IRP-SDE\backend\node_modules" (
    echo.
    echo Installing backend dependencies... This may take a minute...
    echo.
    cd /d "c:\Users\naimu\Desktop\IRP-SDE\backend"
    call npm install --legacy-peer-deps
    if !errorlevel! neq 0 (
        echo Backend installation failed. Check npm logs above.
        pause
        exit /b 1
    )
)

if not exist "c:\Users\naimu\Desktop\IRP-SDE\frontend\node_modules" (
    echo.
    echo Installing frontend dependencies... This may take a minute...
    echo.
    cd /d "c:\Users\naimu\Desktop\IRP-SDE\frontend"
    call npm install --legacy-peer-deps
    if !errorlevel! neq 0 (
        echo Frontend installation failed. Check npm logs above.
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo Starting Smart Dining System
echo ========================================
echo.
echo Starting backend on http://localhost:5000...
cd /d "c:\Users\naimu\Desktop\IRP-SDE\backend"
start "Smart Dining Backend - http://localhost:5000" cmd /k "npm run dev"

echo Starting frontend on http://localhost:3000...
timeout /t 3 /nobreak

cd /d "c:\Users\naimu\Desktop\IRP-SDE\frontend"
start "Smart Dining Frontend - http://localhost:3000" cmd /k "npm run dev"

echo.
echo ========================================
echo Servers are starting...
echo ========================================
echo.
echo Frontend:  http://localhost:3000/auth/login
echo Backend:   http://localhost:5000/api/v1/health
echo.
echo Opening login page in 5 seconds...
timeout /t 5 /nobreak

start http://localhost:3000/auth/login

echo.
echo Servers are ready. See terminal windows for details.
echo Press any key to close this window...
pause
