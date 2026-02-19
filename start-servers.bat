@echo off
REM Set Node.js to PATH
set PATH=C:\Program Files\nodejs;%PATH%

REM Create node_modules directories if they don't exist
if not exist "c:\Users\naimu\Desktop\IRP-SDE\backend\node_modules" (
    echo Installing backend dependencies...
    cd "c:\Users\naimu\Desktop\IRP-SDE\backend"
    call npm install
)

if not exist "c:\Users\naimu\Desktop\IRP-SDE\frontend\node_modules" (
    echo Installing frontend dependencies...
    cd "c:\Users\naimu\Desktop\IRP-SDE\frontend"
    call npm install
)

REM Start backend in background
echo Starting backend server on port 5000...
cd "c:\Users\naimu\Desktop\IRP-SDE\backend"
start "Smart Dining Backend" cmd /k npm run dev

REM Wait a moment
timeout /t 3 /nobreak

REM Start frontend in background
echo Starting frontend server on port 3000...
cd "c:\Users\naimu\Desktop\IRP-SDE\frontend"
start "Smart Dining Frontend" cmd /k npm run dev

REM Open browser
timeout /t 5 /nobreak
echo Opening login page in browser...
start http://localhost:3000/auth/login

echo Both servers are starting. Check the terminal windows that opened.
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5000
echo Login page will open automatically.
pause
