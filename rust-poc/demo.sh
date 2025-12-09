#!/usr/bin/env bash
#
# Demo Script - Shows the PoC in action
#
# This script demonstrates the key improvements of the Rust SDK approach
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

clear

cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   Kaleidoswap Rust SDK - Proof of Concept Demo              ║
║                                                              ║
║   Demonstrating: One Rust codebase → Three SDKs             ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
EOF

echo ""
echo -e "${BOLD}What we built:${NC}"
echo ""
echo "  ✓ Core Rust library (kaleidoswap-core)"
echo "  ✓ Python bindings via PyO3"
echo "  ✓ TypeScript bindings via NAPI-RS"
echo ""

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${BOLD}The Problem (Before):${NC}"
echo ""
cat << 'EOF'
// TypeScript - 10+ lines of boilerplate!
const client = new KaleidoClient({ baseUrl: API_URL });
const pairs = await client.pairList();
const assetMapper = createAssetPairMapper(pairs);
const precisionHandler = createPrecisionHandler(assetMapper.getAllAssets());
const btc = assetMapper.findByTicker('BTC');
const usdt = assetMapper.findByTicker('USDT');
const validation = precisionHandler.validateOrderSize(10000, usdt);
const quote = await client.quoteRequest(
  btc.asset_id, 
  usdt.asset_id, 
  validation.asset_amount
);
EOF

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${BOLD}${GREEN}The Solution (After):${NC}"
echo ""
echo -e "${GREEN}// TypeScript - Just 2 lines! ✨"
echo -e "const client = new KaleidoClient();"
echo -e "const quote = await client.getQuoteByPair('BTC/USDT', 10000);${NC}"

echo ""
echo -e "${GREEN}# Python - Also 2 lines!"
echo -e "client = KaleidoClient()"
echo -e "quote = await client.get_quote_by_pair('BTC/USDT', from_amount=10000)${NC}"

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${BOLD}Key Benefits:${NC}"
echo ""
echo "  ${GREEN}✓${NC} Single source of truth (one Rust codebase)"
echo "  ${GREEN}✓${NC} Type safety across all languages"
echo "  ${GREEN}✓${NC} Better performance (native code)"
echo "  ${GREEN}✓${NC} Easier maintenance (one implementation)"
echo "  ${GREEN}✓${NC} Simplified developer experience"
echo ""

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${BOLD}Build Status:${NC}"
echo ""

# Check if already built
if [ -d "target" ]; then
    echo -e "  ${GREEN}✓${NC} Workspace already built"
else
    echo -e "  ${YELLOW}⚠${NC} Not yet built - run: ${BLUE}./build.sh all${NC}"
fi

echo ""
echo -e "${BOLD}Available Commands:${NC}"
echo ""
echo "  ${BLUE}./build.sh all${NC}       - Build everything"
echo "  ${BLUE}./build.sh check${NC}     - Check dependencies"
echo "  ${BLUE}./test.sh${NC}            - Run all tests"
echo "  ${BLUE}make quick${NC}           - Quick build (core + Python)"
echo "  ${BLUE}make examples${NC}        - Run all examples"
echo ""

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${BOLD}Next Steps:${NC}"
echo ""
echo "  1. Run ${BLUE}./build.sh check${NC} to verify dependencies"
echo "  2. Run ${BLUE}make quick${NC} for a quick build"
echo "  3. Try the examples with ${BLUE}make run-python${NC}"
echo "  4. See ${BLUE}QUICKSTART.md${NC} for detailed instructions"
echo ""

read -p "Would you like to check dependencies now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    ./build.sh check
fi
