@echo off
setlocal

REM Set Node.js paths
set PATH=C:\Program Files\nodejs;%PATH%
set NODE_PATH=C:\Program Files\nodejs

REM Start backend
cd /d "c:\Users\naimu\Desktop\IRP-SDE\backend"
echo Starting backend server...
call npm run dev
