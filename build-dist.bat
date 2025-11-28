@echo off
echo ========================================
echo MediTrack Hospital Management System
echo Distribution Builder
echo ========================================
echo.

:: Check if dependencies are installed
if not exist "node_modules" (
    echo ERROR: Dependencies not installed!
    echo Please run 'setup-first-time.bat' first
    pause
    exit /b 1
)

:: Clean previous builds
echo Cleaning previous builds...
if exist "dist" rmdir /s /q dist
mkdir dist

:: Build for Windows
echo.
echo Building Windows distribution...
npm run build-win
if %errorlevel% neq 0 (
    echo ERROR: Windows build failed
    pause
    exit /b 1
)

:: Build for Linux
echo.
echo Building Linux distribution...
npm run build-linux
if %errorlevel% neq 0 (
    echo ERROR: Linux build failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo BUILD COMPLETE!
echo ========================================
echo.
echo Distribution files created in 'dist' folder:
echo.
dir /b dist
echo.
echo Windows Installer: dist\MediTrack Hospital Management Setup *.exe
echo Windows Portable: dist\MediTrack Hospital Management *.exe
echo Linux AppImage: dist\MediTrack Hospital Management-*.AppImage
echo Linux DEB: dist\meditrack-hospital_*_amd64.deb
echo.
pause