@echo off
echo Installing test dependencies...
npm install

echo.
echo Running unit tests...
npm test

echo.
echo Generating coverage report...
npm run test:coverage

echo.
echo Tests completed! Check coverage folder for detailed report.
pause