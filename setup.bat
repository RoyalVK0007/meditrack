@echo off
echo ========================================
echo MediTrack Hospital System Setup
echo ========================================

echo Installing Node.js dependencies...
npm install

echo.
echo Setting up MySQL database...
echo Please ensure MySQL is running and execute the following:
echo 1. Login to MySQL: mysql -u root -p
echo 2. Run: source sql/schema.sql
echo.
echo To start the server, run: start-server.bat
echo Then open: https://localhost:3000
echo.

echo SSL certificates already generated in backend/certs/
echo.

echo Setup complete! To start the server:
echo npm start
echo.
echo Then open: https://localhost:3000
echo ========================================
pause