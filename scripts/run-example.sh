#!/bin/bash
# Unified Example Runner for Kaleidoswap SDK
# Usage: ./scripts/run-example.sh [python|typescript] [example-name]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Default environment
export KALEIDO_API_URL="${KALEIDO_API_URL:-http://localhost:8000}"
export KALEIDO_NODE_URL="${KALEIDO_NODE_URL:-http://localhost:3001}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

usage() {
    echo "Usage: $0 [python|typescript|ts] [example-name]"
    echo ""
    echo "Examples:"
    echo "  $0 python swap        # Run Python swap example"
    echo "  $0 typescript swap    # Run TypeScript swap example"
    echo "  $0 ts swap            # Short form"
    echo ""
    echo "Environment:"
    echo "  KALEIDO_API_URL:  ${KALEIDO_API_URL}"
    echo "  KALEIDO_NODE_URL: ${KALEIDO_NODE_URL}"
    exit 1
}

check_services() {
    echo -e "${YELLOW}🔍 Checking services...${NC}"
    
    # Check API
    if curl -s -o /dev/null -w "%{http_code}" "${KALEIDO_API_URL}/health" 2>/dev/null | grep -q 200; then
        echo -e "  ${GREEN}✅ API running${NC} (${KALEIDO_API_URL})"
    else
        echo -e "  ${RED}❌ API not available${NC} (${KALEIDO_API_URL})"
        echo -e "     Make sure the API server is running"
        exit 1
    fi

    # Check Node
    if curl -s -o /dev/null -w "%{http_code}" "${KALEIDO_NODE_URL}/nodeinfo" 2>/dev/null | grep -q 200; then
        echo -e "  ${GREEN}✅ Node running${NC} (${KALEIDO_NODE_URL})"
    else
        echo -e "  ${YELLOW}⚠️  Node not available${NC} (${KALEIDO_NODE_URL})"
        echo -e "     Some examples may not work without a node"
    fi
    echo ""
}

run_python() {
    local example_name="$1"
    local example_file="${ROOT_DIR}/python-sdk/examples/${example_name}_example.py"

    if [ ! -f "$example_file" ]; then
        echo -e "${RED}❌ Example not found: ${example_file}${NC}"
        exit 1
    fi

    echo -e "${GREEN}🐍 Running Python SDK example: ${example_name}${NC}"
    echo ""

    cd "${ROOT_DIR}/python-sdk"
    
    # Ensure dependencies are installed
    if ! command -v uv &> /dev/null; then
        echo -e "${RED}❌ 'uv' not found. Please install it first.${NC}"
        exit 1
    fi

    uv run "examples/${example_name}_example.py"
}

run_typescript() {
    local example_name="$1"
    local example_file="${ROOT_DIR}/typescript-sdk/examples/${example_name}_example.ts"

    if [ ! -f "$example_file" ]; then
        echo -e "${RED}❌ Example not found: ${example_file}${NC}"
        exit 1
    fi

    echo -e "${GREEN}📦 Running TypeScript SDK example: ${example_name}${NC}"
    echo ""

    cd "${ROOT_DIR}/typescript-sdk"

    # Ensure Node modules are installed
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}⚙️  Installing dependencies...${NC}"
        pnpm install
    fi

    pnpm exec tsx "examples/${example_name}_example.ts"
}

# Parse arguments
if [ $# -lt 2 ]; then
    usage
fi

LANG="$1"
EXAMPLE="$2"

# Normalize language input
case "$LANG" in
    python|py)
        LANG="python"
        ;;
    typescript|ts)
        LANG="typescript"
        ;;
    *)
        echo -e "${RED}❌ Unknown language: $LANG${NC}"
        usage
        ;;
esac

# Check services before running
check_services

# Run the appropriate example
case "$LANG" in
    python)
        run_python "$EXAMPLE"
        ;;
    typescript)
        run_typescript "$EXAMPLE"
        ;;
esac
