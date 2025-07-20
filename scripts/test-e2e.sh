#!/bin/bash

echo "Running End-to-End Tests with Cypress..."
echo "=========================================="

# Check if both servers are running
echo "Checking if servers are running..."

# Check Django backend
if ! curl -s http://localhost:8000/api/rooms/ > /dev/null; then
    echo "Django backend is not running on port 8000"
    echo "Please start the backend server first:"
    echo "cd backend && source venv/bin/activate && python manage.py runserver 0.0.0.0:8000"
    exit 1
fi

# Check React frontend
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "React frontend is not running on port 3000"
    echo "Please start the frontend server first:"
    echo "cd frontend && npm start"
    exit 1
fi

echo "Both servers are running"

# Navigate to frontend directory
cd frontend

# Run Cypress tests in headless mode
echo "Running Cypress tests..."
npx cypress run --spec "cypress/e2e/scorecard.cy.ts"

# Check exit code
if [ $? -eq 0 ]; then
    echo "All end-to-end tests passed!"
else
    echo "Some end-to-end tests failed!"
    echo "Check the Cypress screenshots and videos for details."
    exit 1
fi 