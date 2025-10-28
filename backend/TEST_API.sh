#!/bin/bash

# Quick test script for BSC Escrow API

echo "🧪 Testing BSC Escrow API..."
echo ""

BASE_URL="http://localhost:5000"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo "1️⃣  Testing Health Check..."
HEALTH=$(curl -s $BASE_URL/health)
if echo $HEALTH | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Health check passed${NC}"
    echo $HEALTH | jq .data.blockchain 2>/dev/null || echo $HEALTH
else
    echo -e "${RED}❌ Health check failed${NC}"
    echo $HEALTH
fi
echo ""

# Test 2: Factory Owner
echo "2️⃣  Testing Factory Owner..."
OWNER=$(curl -s $BASE_URL/api/v1/factory/owner)
if echo $OWNER | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Factory owner endpoint works${NC}"
    echo $OWNER | jq .data.owner 2>/dev/null || echo $OWNER
else
    echo -e "${RED}❌ Factory owner failed${NC}"
    echo $OWNER | jq . 2>/dev/null || echo $OWNER
fi
echo ""

# Test 3: Reward Distributor Info
echo "3️⃣  Testing Reward Distributor Info..."
REWARD=$(curl -s $BASE_URL/api/v1/rewards/info)
if echo $REWARD | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Reward distributor endpoint works${NC}"
    echo $REWARD | jq .data 2>/dev/null || echo $REWARD
else
    echo -e "${RED}❌ Reward distributor failed${NC}"
    echo $REWARD | jq . 2>/dev/null || echo $REWARD
fi
echo ""

# Test 4: Swagger Docs
echo "4️⃣  Testing Swagger Documentation..."
SWAGGER=$(curl -s $BASE_URL/api-docs.json)
if echo $SWAGGER | grep -q '"openapi"'; then
    echo -e "${GREEN}✅ Swagger docs available${NC}"
    echo "Visit: $BASE_URL/api-docs"
else
    echo -e "${RED}❌ Swagger docs not available${NC}"
fi
echo ""

echo "🎉 All tests complete!"
echo ""
echo "📚 Full API documentation: $BASE_URL/api-docs"

