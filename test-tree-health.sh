#!/bin/bash
# Tree Health Monitoring - Quick Test Script
# Usage: Run this after `pnpm dev` is running

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_BASE="http://localhost:5000"

echo -e "${YELLOW}🌳 Tree Health Monitoring - Test Script${NC}"
echo "Testing tree health critical conditions..."
echo ""

# Test 1: Critical - High Temperature
echo -e "${YELLOW}Test 1: Critical - High Temperature (>40°C)${NC}"
curl -X POST "$API_BASE/api/iot/CG-RPR-2026-000001" \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 42,
    "soilMoisture": 45,
    "humidity": 60
  }' \
  -s | jq .

echo ""
echo -e "${GREEN}✅ Check dashboard for toast notification and red card!${NC}"
echo ""

# Test 2: Critical - Low Moisture
echo -e "${YELLOW}Test 2: Critical - Low Soil Moisture (<20%)${NC}"
curl -X POST "$API_BASE/api/iot/CG-RPR-2026-000002" \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 30,
    "soilMoisture": 15,
    "humidity": 70
  }' \
  -s | jq .

echo ""
echo -e "${GREEN}✅ Check dashboard for toast notification and red card!${NC}"
echo ""

# Test 3: Critical - Both Conditions
echo -e "${YELLOW}Test 3: Critical - Both Conditions (High Temp + Low Moisture)${NC}"
curl -X POST "$API_BASE/api/iot/CG-RPR-2026-000003" \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 42,
    "soilMoisture": 15,
    "humidity": 50
  }' \
  -s | jq .

echo ""
echo -e "${GREEN}✅ This should trigger both alerts!${NC}"
echo ""

# Test 4: Warning - Temperature
echo -e "${YELLOW}Test 4: Warning - Temperature (35-40°C)${NC}"
curl -X POST "$API_BASE/api/iot/CG-RPR-2026-000004" \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 37,
    "soilMoisture": 35,
    "humidity": 55
  }' \
  -s | jq .

echo ""
echo -e "${YELLOW}ℹ️ This should show yellow warning state${NC}"
echo ""

# Test 5: Normal - All Good
echo -e "${YELLOW}Test 5: Normal - All Optimal${NC}"
curl -X POST "$API_BASE/api/iot/CG-RPR-2026-000005" \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 28,
    "soilMoisture": 50,
    "humidity": 65
  }' \
  -s | jq .

echo ""
echo -e "${GREEN}✅ This should show green normal state${NC}"
echo ""

echo -e "${YELLOW}Test Complete!${NC}"
echo ""
echo "View results:"
echo "  Frontend: http://localhost:5173/dashboard"
echo "  Check browser console for any errors"
echo "  Look for toast notifications in top-right corner"
echo ""
echo "Verify:"
echo "  ✓ Toast notifications appear for critical conditions"
echo "  ✓ Tree cards turn red when critical"
echo "  ✓ Tree cards turn yellow when warning"
echo "  ✓ Tree cards stay white when normal"
echo "  ✓ Severity badges display correctly"
echo "  ✓ Alert messages are clear and specific"
