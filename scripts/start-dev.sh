#!/bin/bash

# Development startup script for Scorecard App
# This script starts both the Django backend and React frontend

set -e

echo "Starting Scorecard App Development Environment..."

# Function to cleanup background processes on exit
cleanup() {
    echo "Shutting down development servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check if we're in the right directory
if [ ! -f "backend/manage.py" ]; then
    echo "Error: Please run this script from the project root directory"
    exit 1
fi

# Check if Python virtual environment exists
if [ ! -d "backend/venv" ]; then
    echo "Setting up Python virtual environment..."
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
else
    echo "Activating Python virtual environment..."
    cd backend
    source venv/bin/activate
    cd ..
fi

# Check if Node modules exist
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing Node.js dependencies..."
    cd frontend
    npm install
    cd ..
fi

# Start Django backend
echo "Starting Django backend server..."
cd backend
source venv/bin/activate
python manage.py migrate
python manage.py runserver 0.0.0.0:8000 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start React frontend
echo "Starting React frontend server..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo "Development servers started!"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8000/api/"
echo "Django Admin: http://localhost:8000/admin/"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for background processes
wait 