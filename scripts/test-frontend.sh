#!/bin/bash

# Frontend testing script for Scorecard App

set -e

echo "Running React Frontend Tests..."

# Check if we're in the right directory
if [ ! -f "frontend/package.json" ]; then
    echo "Error: Please run this script from the project root directory"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing Node.js dependencies..."
    cd frontend
    npm install
    cd ..
fi

# Run frontend tests
cd frontend
echo "Running React tests..."
npm test -- --watchAll=false --coverage --passWithNoTests

echo "Frontend tests completed!" 