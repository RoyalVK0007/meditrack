@echo off
echo ========================================
echo MediTrack Database Setup
echo ========================================
echo.
echo 1. Make sure MySQL is installed and running
echo 2. Update backend/db.js with your MySQL password
echo 3. Run this command to create database:
echo.
echo mysql -u root -p -e "source sql/schema.sql"
echo.
echo Or manually:
echo mysql -u root -p
echo source sql/schema.sql;
echo.
pause