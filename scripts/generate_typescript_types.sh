#!/bin/bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SPECS_DIR="$ROOT_DIR/specs"
OUTPUT_DIR="$ROOT_DIR/typescript-sdk/src/generated"

echo "🔧 Generating TypeScript types from OpenAPI specs..."

# Check if openapi-typescript is available
if ! command -v openapi-typescript &> /dev/null; then
    echo "⚠️  openapi-typescript not found globally. Using npx..."
    OPENAPI_CMD="npx openapi-typescript"
else
    OPENAPI_CMD="openapi-typescript"
fi

mkdir -p "$OUTPUT_DIR"

# Generate Maker API types
echo "  → Generating from kaleidoswap.json..."
$OPENAPI_CMD "$SPECS_DIR/kaleidoswap.json" \
    -o "$OUTPUT_DIR/api-types.ts" \
    --export-type

# Generate Node API types
echo "  → Generating from rgb-lightning-node.yaml..."
$OPENAPI_CMD "$SPECS_DIR/rgb-lightning-node.yaml" \
    -o "$OUTPUT_DIR/node-types.ts" \
    --export-type

# Format the generated files with prettier
echo "  → Formatting generated files with prettier..."
cd "$ROOT_DIR/typescript-sdk"

# Check if prettier is available
if ! command -v prettier &> /dev/null; then
    echo "⚠️  prettier not found globally. Using npx..."
    PRETTIER_CMD="npx prettier"
else
    PRETTIER_CMD="prettier"
fi

# Format the generated files
$PRETTIER_CMD --write "$OUTPUT_DIR/api-types.ts" "$OUTPUT_DIR/node-types.ts"

echo "✅ TypeScript types generated and formatted successfully"
