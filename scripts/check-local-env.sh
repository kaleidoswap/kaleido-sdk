#!/bin/bash
# Check Local Development Environment for Kaleidoswap SDK

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Environment
KALEIDO_API_URL="${KALEIDO_API_URL:-http://localhost:8000}"
KALEIDO_NODE_URL="${KALEIDO_NODE_URL:-http://localhost:3001}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Kaleidoswap SDK - Environment Check${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check Services
echo -e "${YELLOW}📡 Services${NC}"
echo "---"

# API Check
echo -n "API ($KALEIDO_API_URL): "
if response=$(curl -s -o /dev/null -w "%{http_code}" "$KALEIDO_API_URL/health" 2>/dev/null) && [ "$response" = "200" ]; then
    echo -e "${GREEN}✅ Running${NC}"
    API_OK=1
else
    echo -e "${RED}❌ Not available${NC}"
    API_OK=0
fi

# Node Check
echo -n "Node ($KALEIDO_NODE_URL): "
if response=$(curl -s -o /dev/null -w "%{http_code}" "$KALEIDO_NODE_URL/nodeinfo" 2>/dev/null) && [ "$response" = "200" ]; then
    echo -e "${GREEN}✅ Running${NC}"
    NODE_OK=1
    
    # Get node info
    if command -v jq &> /dev/null; then
        node_info=$(curl -s "$KALEIDO_NODE_URL/nodeinfo" 2>/dev/null)
        num_channels=$(echo "$node_info" | jq -r '.num_channels // "N/A"')
        echo "   Channels: $num_channels"
    fi
else
    echo -e "${YELLOW}⚠️  Not available${NC}"
    NODE_OK=0
fi

echo ""

# Check Dependencies
echo -e "${YELLOW}🔧 Dependencies${NC}"
echo "---"

# Python
echo -n "Python: "
if command -v python3 &> /dev/null; then
    python_version=$(python3 --version | awk '{print $2}')
    echo -e "${GREEN}✅ $python_version${NC}"
    PYTHON_OK=1
else
    echo -e "${RED}❌ Not installed${NC}"
    PYTHON_OK=0
fi

# UV
echo -n "uv (Python): "
if command -v uv &> /dev/null; then
    uv_version=$(uv --version 2>&1 | awk '{print $2}')
    echo -e "${GREEN}✅ $uv_version${NC}"
    UV_OK=1
else
    echo -e "${YELLOW}⚠️  Not installed${NC} (pip install uv)"
    UV_OK=0
fi

# Node.js
echo -n "Node.js: "
if command -v node &> /dev/null; then
    node_version=$(node --version)
    echo -e "${GREEN}✅ $node_version${NC}"
    NODE_JS_OK=1
else
    echo -e "${RED}❌ Not installed${NC}"
    NODE_JS_OK=0
fi

# pnpm
echo -n "pnpm: "
if command -v pnpm &> /dev/null; then
    pnpm_version=$(pnpm --version)
    echo -e "${GREEN}✅ $pnpm_version${NC}"
    PNPM_OK=1
else
    echo -e "${YELLOW}⚠️  Not installed${NC} (npm install -g pnpm)"
    PNPM_OK=0
fi

# jq (optional but useful)
echo -n "jq (optional): "
if command -v jq &> /dev/null; then
    jq_version=$(jq --version | cut -d'-' -f2)
    echo -e "${GREEN}✅ $jq_version${NC}"
else
    echo -e "${YELLOW}⚠️  Not installed${NC}"
fi

echo ""

# Summary
echo -e "${YELLOW}📊 Summary${NC}"
echo "---"

total_checks=0
passed_checks=0

# Critical checks
if [ $API_OK -eq 1 ]; then ((passed_checks++)); fi; ((total_checks++))

# Python checks
if [ $PYTHON_OK -eq 1 ]; then ((passed_checks++)); fi; ((total_checks++))
if [ $UV_OK -eq 1 ]; then ((passed_checks++)); fi; ((total_checks++))

# TypeScript checks
if [ $NODE_JS_OK -eq 1 ]; then ((passed_checks++)); fi; ((total_checks++))
if [ $PNPM_OK -eq 1 ]; then ((passed_checks++)); fi; ((total_checks++))

echo "Status: $passed_checks/$total_checks checks passed"

if [ $passed_checks -eq $total_checks ]; then
    echo -e "${GREEN}✅ Environment is ready!${NC}"
    echo ""
    echo "Quick commands:"
    echo "  make dev-setup           # Setup development environment"
    echo "  make run-python-example  # Run Python example"
    echo "  make run-ts-example      # Run TypeScript example"
    exit 0
elif [ $API_OK -eq 0 ]; then
    echo -e "${RED}❌ Critical dependencies missing${NC}"
    exit 1
else
    echo -e "${YELLOW}⚠️  Some dependencies missing (partial functionality)${NC}"
    exit 0
fi
