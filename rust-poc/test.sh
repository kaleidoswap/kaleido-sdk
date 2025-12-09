#!/usr/bin/env bash
#
# Test Script for Rust SDK PoC
# 
# Runs all available tests and provides a summary
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Running all PoC tests...${NC}\n"

# Track results
TOTAL=0
PASSED=0
FAILED=0

run_test() {
    local name="$1"
    local cmd="$2"
    
    TOTAL=$((TOTAL + 1))
    echo -e "${BLUE}Test $TOTAL: $name${NC}"
    
    if eval "$cmd"; then
        echo -e "${GREEN}✓ PASSED${NC}\n"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}\n"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# Run tests
run_test "Core Rust library compiles" "cd kaleidoswap-core && cargo check --quiet"
run_test "Core Rust tests pass" "cd kaleidoswap-core && cargo test --quiet"
run_test "Python bindings compile" "cd kaleidoswap-python && cargo check --quiet"
run_test "TypeScript bindings compile" "cd kaleidoswap-node && cargo check --quiet"

# Cleanup (return to root)
cd "$SCRIPT_DIR"

# Summary
echo ""
echo "======================================"
echo -e "${BLUE}Test Summary${NC}"
echo "======================================"
echo "Total:  $TOTAL"
echo -e "${GREEN}Passed: $PASSED${NC}"
if [ $FAILED -gt 0 ]; then
    echo -e "${RED}Failed: $FAILED${NC}"
else
    echo "Failed: $FAILED"
fi
echo "======================================"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed.${NC}"
    exit 1
fi
