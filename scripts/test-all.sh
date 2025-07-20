#!/bin/bash

# Complete testing script for Scorecard App

set -e

echo "Running All Tests for Scorecard App..."
echo "=========================================="

# Run backend tests
echo ""
echo "Testing Django Backend..."
./scripts/test-backend.sh

# Run frontend tests
echo ""
echo "Testing React Frontend..."
./scripts/test-frontend.sh

echo ""
echo "All tests completed successfully!"
echo "Your Scorecard App is ready for development!" 