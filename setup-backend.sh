#!/bin/bash

echo "========================================"
echo "   Stellar Strider Backend Setup"
echo "========================================"
echo

echo "[1/4] Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi

echo
echo "[2/4] Initializing database with sample data..."
npm run init-db
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to initialize database"
    exit 1
fi

echo
echo "[3/4] Starting backend server..."
echo "Backend API will be available at: http://localhost:3001"
echo "API Documentation: http://localhost:3001/api"
echo "Health Check: http://localhost:3001/health"
echo
echo "Press Ctrl+C to stop the server"
echo

npm run dev