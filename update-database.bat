@echo off
echo Updating MediTrack Database...
echo.

echo 1. Dropping and recreating database with new schema...
mysql -u root -p < sql/schema.sql

echo.
echo 2. Database updated successfully!
echo.
echo Demo accounts created:
echo - Admin: admin / password123
echo - Doctor: doctor1 / password123  
echo - Nurse: nurse1 / password123
echo - Reception: reception1 / password123
echo.
pause