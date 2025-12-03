#!/bin/bash
set -e

# Script to auto-generate TypeScript SDK from OpenAPI specs
# Following best practices: separate generated code from hand-written code

echo "🔄 Generating TypeScript SDK from OpenAPI specs..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SPECS_DIR="$PROJECT_ROOT/specs"
TS_DIR="$PROJECT_ROOT/typescript"
GENERATED_DIR="$TS_DIR/src/generated"

# Ensure we have the necessary tools
cd "$TS_DIR"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  Node modules not found. Installing dependencies...${NC}"
    npm ci
fi

# Ensure openapi-typescript-codegen is installed
if ! npm list openapi-typescript-codegen >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  openapi-typescript-codegen not found. Installing...${NC}"
    npm install --save-dev openapi-typescript-codegen
fi

echo -e "${BLUE}📦 Generating Kaleidoswap SDK (from kaleidoswap.json)...${NC}"

# Remove old generated files for Kaleidoswap
rm -rf "$GENERATED_DIR/kaleido"

# Generate Kaleidoswap SDK
npx openapi-typescript-codegen \
    --input "$SPECS_DIR/kaleidoswap.json" \
    --output "$GENERATED_DIR/kaleido" \
    --client fetch \
    --name KaleidoApiClient \
    --useOptions \
    --exportCore true \
    --exportServices true \
    --exportModels true

echo -e "${GREEN}✅ Kaleidoswap SDK generated${NC}"

echo -e "${BLUE}📦 Generating RGB Lightning Node SDK (from rgb-lightning-node.yaml)...${NC}"

# Remove old generated files for RGB Node
rm -rf "$GENERATED_DIR/rgb-node"

# Generate RGB Node SDK
npx openapi-typescript-codegen \
    --input "$SPECS_DIR/rgb-lightning-node.yaml" \
    --output "$GENERATED_DIR/rgb-node" \
    --client fetch \
    --name RgbNodeClient \
    --useOptions \
    --exportCore true \
    --exportServices true \
    --exportModels true

echo -e "${GREEN}✅ RGB Lightning Node SDK generated${NC}"

# Add generation timestamp and warning
TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
for dir in "$GENERATED_DIR/kaleido" "$GENERATED_DIR/rgb-node"; do
    if [ -f "$dir/index.ts" ]; then
        # Add header comment to index file
        cat > "$dir/.generated-warning.ts" << EOF
/**
 * ⚠️ AUTO-GENERATED CODE - DO NOT EDIT MANUALLY
 * 
 * This code was auto-generated from OpenAPI specifications.
 * Generated at: $TIMESTAMP
 * 
 * To regenerate, run: make generate-typescript
 * 
 * Any manual changes will be lost on next generation.
 * Put custom code in the parent directories (not in /generated).
 */

EOF
    fi
done

echo -e "${GREEN}✨ TypeScript SDK generation complete!${NC}"
echo ""
echo -e "${BLUE}Generated modules:${NC}"
echo "  • $GENERATED_DIR/kaleido/    - Kaleidoswap API client"
echo "  • $GENERATED_DIR/rgb-node/   - RGB Lightning Node client"
echo ""
echo -e "${YELLOW}⚠️  Remember: Generated code should not be edited manually${NC}"
echo "   Hand-written convenience methods should go in src/client.ts"

