#!/bin/bash

# Complete setup script for Scorecard App
# This script sets up the entire development environment

set -e

echo "Setting up Scorecard App Development Environment..."
echo "====================================================="

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v python3 &> /dev/null; then
    echo "Python 3 is required but not installed"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "Node.js is required but not installed"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "npm is required but not installed"
    exit 1
fi

echo "Prerequisites check passed"

# Setup backend
echo ""
echo "🔧 Setting up Django Backend..."
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Install dependencies
echo "Installing Python dependencies..."
venv/bin/pip install -r requirements.txt

# Run migrations
echo "Running database migrations..."
venv/bin/python manage.py makemigrations api
venv/bin/python manage.py migrate

# Run backend tests
echo "Running backend tests..."
venv/bin/python manage.py test

cd ..

# Setup frontend
echo ""
echo "📱 Setting up React Frontend..."
cd frontend

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install
fi

cd ..

# Make scripts executable
echo ""
echo "🔧 Setting up development scripts..."
chmod +x scripts/*.sh

echo ""
echo "Setup completed successfully!"
echo ""
echo "Your Scorecard App is ready for development!"
echo ""
echo "To start the development servers:"
echo "  ./scripts/start-dev.sh"
echo ""
echo "To run all tests:"
echo "  ./scripts/test-all.sh"
echo ""
echo "To validate the API:"
echo "  ./scripts/validate-api.sh"
echo ""
echo "Frontend will be available at: http://localhost:3000"
echo "Backend API will be available at: http://localhost:8000/api/"
echo "Django Admin will be available at: http://localhost:8000/admin/" 