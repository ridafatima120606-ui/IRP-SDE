@echo off
setlocal

REM Set Node.js paths
set PATH=C:\Program Files\nodejs;%PATH%
set NODE_PATH=C:\Program Files\nodejs
set NODE_OPTIONS=--no-warnings

REM Start frontend
cd /d "c:\Users\naimu\Desktop\IRP-SDE\frontend"
echo Starting frontend server on http://localhost:3000...
call npm run dev
