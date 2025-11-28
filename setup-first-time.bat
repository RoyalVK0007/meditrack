@echo off
echo ========================================
echo MediTrack Hospital Management System
echo First Time Setup Script
echo ========================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

:: Check if MySQL is running
echo Checking MySQL connection...
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: MySQL command not found in PATH
    echo Please ensure MySQL 8.0+ is installed and running
    echo.
)

:: Install dependencies
echo Installing Node.js dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

:: Create necessary directories
echo Creating directories...
if not exist "reports" mkdir reports
if not exist "dist" mkdir dist
if not exist "backend\certs" mkdir backend\certs

:: Generate SSL certificates
echo Generating SSL certificates...
cd backend\certs
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/C=IN/ST=State/L=City/O=MediTrack/CN=localhost" >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: OpenSSL not found. Using default certificates.
    echo You may need to install OpenSSL or use the provided certificates.
)
cd ..\..

:: Setup database
echo.
echo ========================================
echo DATABASE SETUP
echo ========================================
echo Please ensure MySQL is running and you have admin access.
echo.
set /p db_user="Enter MySQL username (default: root): "
if "%db_user%"=="" set db_user=root

set /p db_pass="Enter MySQL password: "

echo Creating database schema...
mysql -u %db_user% -p%db_pass% < sql\schema.sql
if %errorlevel% neq 0 (
    echo ERROR: Failed to create database schema
    echo Please check your MySQL credentials and try again
    pause
    exit /b 1
)

echo.
echo ========================================
echo SETUP COMPLETE!
echo ========================================
echo.
echo Next steps:
echo 1. Run 'npm start' to start the web server
echo 2. Run 'npm run electron' to start the desktop app
echo 3. Run 'npm run build-all' to create distribution packages
echo.
echo Access the application at: https://localhost:3000
echo (Accept the SSL certificate warning for self-signed certificate)
echo.
pause