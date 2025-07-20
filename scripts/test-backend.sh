#!/bin/bash

# Backend testing script for Scorecard App

set -e

echo "Running Django Backend Tests..."

# Check if we're in the right directory
if [ ! -f "backend/manage.py" ]; then
    echo "Error: Please run this script from the project root directory"
    exit 1
fi

# Activate virtual environment
cd backend
if [ -d "venv" ]; then
    source venv/bin/activate
else
    echo "Error: Virtual environment not found. Run start-dev.sh first."
    exit 1
fi

# Install test dependencies if not already installed
pip install -q pytest pytest-django coverage factory-boy

# Run tests with coverage
echo "Running tests with coverage..."
coverage run --source='.' manage.py test

# Generate coverage report
echo ""
echo "Coverage Report:"
coverage report

# Generate HTML coverage report
coverage html
echo "HTML coverage report generated in backend/htmlcov/"

# Run specific test files if provided
if [ $# -gt 0 ]; then
    echo ""
    echo "Running specific tests: $@"
    python manage.py test "$@"
fi

echo "Backend tests completed!" 