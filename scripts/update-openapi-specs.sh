#!/bin/bash
set -e

# Script to fetch/update OpenAPI specifications from remote sources

echo "🔄 Updating OpenAPI specifications..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SPECS_DIR="$PROJECT_ROOT/specs"

# Ensure specs directory exists
mkdir -p "$SPECS_DIR"

# URLs for OpenAPI specs
KALEIDOSWAP_API_URL="https://api.staging.kaleidoswap.com/openapi.json"
RGB_NODE_API_URL="https://raw.githubusercontent.com/RGB-Tools/rgb-lightning-node/master/openapi.yaml"

echo -e "${BLUE}📥 Downloading Kaleidoswap OpenAPI spec...${NC}"
if curl -f -s -o "$SPECS_DIR/kaleidoswap.json" "$KALEIDOSWAP_API_URL"; then
    echo -e "${GREEN}✅ Kaleidoswap spec updated${NC}"
    # Pretty print if jq is available
    if command -v jq &> /dev/null; then
        jq '.' "$SPECS_DIR/kaleidoswap.json" > "$SPECS_DIR/kaleidoswap.json.tmp" && \
        mv "$SPECS_DIR/kaleidoswap.json.tmp" "$SPECS_DIR/kaleidoswap.json"
    fi
else
    echo -e "${RED}❌ Failed to download Kaleidoswap spec${NC}"
    echo -e "${YELLOW}   Keeping existing spec if available${NC}"
fi

echo -e "${BLUE}📥 Downloading RGB Lightning Node OpenAPI spec...${NC}"
if curl -f -s -o "$SPECS_DIR/rgb-lightning-node.yaml" "$RGB_NODE_API_URL"; then
    echo -e "${GREEN}✅ RGB Lightning Node spec updated${NC}"
else
    echo -e "${RED}❌ Failed to download RGB Lightning Node spec${NC}"
    echo -e "${YELLOW}   Keeping existing spec if available${NC}"
fi

echo ""
echo -e "${GREEN}✨ OpenAPI specifications updated!${NC}"
echo ""
echo -e "${BLUE}Updated specs:${NC}"
echo "  • $SPECS_DIR/kaleidoswap.json"
echo "  • $SPECS_DIR/rgb-lightning-node.yaml"
echo ""
echo -e "${YELLOW}💡 Next step: Run 'make generate' to regenerate SDKs${NC}"

