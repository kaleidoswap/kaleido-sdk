#!/bin/bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SPECS_DIR="$ROOT_DIR/crates/kaleidoswap-core/specs"
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
echo "  → Generating from maker.json..."
$OPENAPI_CMD "$SPECS_DIR/maker.json" \
    -o "$OUTPUT_DIR/api-types.ts" \
    --export-type

# Generate Node API types
echo "  → Generating from rln.yaml..."
$OPENAPI_CMD "$SPECS_DIR/rln.yaml" \
    -o "$OUTPUT_DIR/node-types.ts" \
    --export-type

echo "✅ TypeScript types generated successfully"
