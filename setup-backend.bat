@echo off
echo ========================================
echo   Stellar Strider Backend Setup
echo ========================================
echo.

echo [1/4] Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [2/4] Initializing database with sample data...
call npm run init-db
if %errorlevel% neq 0 (
    echo ERROR: Failed to initialize database
    pause
    exit /b 1
)

echo.
echo [3/4] Starting backend server...
echo Backend API will be available at: http://localhost:3001
echo API Documentation: http://localhost:3001/api
echo Health Check: http://localhost:3001/health
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev