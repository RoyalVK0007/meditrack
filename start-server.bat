@echo off
echo Starting MediTrack Hospital Server...
echo.
echo Make sure MySQL is running and database is set up!
echo.
cd /d "%~dp0"
node backend/server.js
pause