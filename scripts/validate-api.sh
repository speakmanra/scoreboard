#!/bin/bash

# API validation script using curl

set -e

echo "Validating Scorecard API Endpoints..."
echo "========================================"

# Base URL
BASE_URL="http://localhost:8000/api"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -n "Testing $description... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "%{http_code}" -o /tmp/response.json "$BASE_URL$endpoint")
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -w "%{http_code}" -o /tmp/response.json -X POST \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint")
    fi
    
    http_code="${response: -3}"
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓ PASS${NC} ($http_code)"
        if [ -s /tmp/response.json ]; then
            echo "  Response: $(cat /tmp/response.json | head -c 100)..."
        fi
    else
        echo -e "${RED}✗ FAIL${NC} ($http_code)"
        if [ -s /tmp/response.json ]; then
            echo "  Error: $(cat /tmp/response.json)"
        fi
    fi
}

# Wait for server to be ready
echo "Waiting for server to be ready..."
for i in {1..30}; do
    if curl -s "$BASE_URL/rooms/" > /dev/null 2>&1; then
        echo -e "${GREEN}Server is ready!${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}Server not responding after 30 seconds${NC}"
        exit 1
    fi
    sleep 1
done

echo ""
echo "Testing API Endpoints:"
echo "====================="

# Test rooms endpoint
test_endpoint "GET" "/rooms/" "" "GET rooms list"

# Test creating a room
test_endpoint "POST" "/rooms/" '{"name":"Test Room","game_type":"yahtzee"}' "CREATE room"

# Get the created room's room_code
if [ -s /tmp/response.json ]; then
    room_code=$(cat /tmp/response.json | grep -o '"room_code":"[^"]*"' | cut -d'"' -f4)
    if [ ! -z "$room_code" ]; then
        echo "  Created room with code: $room_code"
        
        # Test getting room by code
        test_endpoint "GET" "/rooms/by_code/?code=$room_code" "" "GET room by code"
        
        # Get room ID for further tests
        room_id=$(cat /tmp/response.json | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
        if [ ! -z "$room_id" ]; then
            echo "  Room ID: $room_id"
            
            # Test joining room
            test_endpoint "POST" "/rooms/$room_id/join/" '{"name":"Test Player"}' "JOIN room"
            
            # Test getting players
            test_endpoint "GET" "/players/?room_id=$room_id" "" "GET players in room"
            
            # Test getting scores
            test_endpoint "GET" "/scores/?room_id=$room_id" "" "GET scores in room"
            
            # Test room summary
            test_endpoint "GET" "/scores/room_summary/?room_id=$room_id" "" "GET room summary"
        fi
    fi
fi

echo ""
echo -e "${GREEN}API validation completed!${NC}"

# Cleanup
rm -f /tmp/response.json 