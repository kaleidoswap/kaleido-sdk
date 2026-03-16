#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SPECS_DIR="$ROOT_DIR/specs"
OUTPUT_DIR="$ROOT_DIR/typescript-sdk/src/generated"

echo "🔧 Generating TypeScript types from OpenAPI specs..."

# Validate spec files exist
for spec in "$SPECS_DIR/kaleidoswap.json" "$SPECS_DIR/rgb-lightning-node.yaml"; do
    [ -f "$spec" ] || { echo "❌ Missing spec file: $spec"; exit 1; }
done

# Resolve node: prefer the one in PATH, fail clearly if missing
if ! command -v node &> /dev/null; then
    echo "❌ node not found. Please install Node.js >= 18."
    exit 1
fi

OTS_BIN=""
# Resolve openapi-typescript binary: local node_modules, then global
if [ -x "$ROOT_DIR/typescript-sdk/node_modules/.bin/openapi-typescript" ]; then
    OTS_BIN="$ROOT_DIR/typescript-sdk/node_modules/.bin/openapi-typescript"
elif command -v openapi-typescript &> /dev/null; then
    OTS_BIN="openapi-typescript"
else
    echo "❌ openapi-typescript not found."
    echo "   Install with: npm install -g openapi-typescript"
    echo "   Or: cd typescript-sdk && pnpm install"
    exit 1
fi

# Resolve prettier binary: local node_modules, then global
if [ -x "$ROOT_DIR/typescript-sdk/node_modules/.bin/prettier" ]; then
    PRETTIER_BIN="$ROOT_DIR/typescript-sdk/node_modules/.bin/prettier"
elif command -v prettier &> /dev/null; then
    PRETTIER_BIN="prettier"
else
    echo "❌ prettier not found."
    echo "   Install with: npm install -g prettier"
    echo "   Or: cd typescript-sdk && pnpm install"
    exit 1
fi

BANNER="/**
 * AUTO-GENERATED FILE — DO NOT EDIT MANUALLY.
 *
 * Re-generate with:
 *   pnpm generate:types
 *   (or: bash scripts/generate_typescript_types.sh)
 */
"

mkdir -p "$OUTPUT_DIR"

generate_types() {
    local input="$1" output="$2" tmp
    echo "  → Generating from $(basename "$input")..."
    "$OTS_BIN" "$input" --export-type --enum --dedupe-enums -o "$output"
    tmp=$(mktemp)
    printf '%s\n' "$BANNER" | cat - "$output" > "$tmp" && mv "$tmp" "$output"
    echo "     ✔ Written to ${output#$ROOT_DIR/}"
}

generate_types "$SPECS_DIR/kaleidoswap.json"        "$OUTPUT_DIR/api-types.ts"
generate_types "$SPECS_DIR/rgb-lightning-node.yaml" "$OUTPUT_DIR/node-types.ts"

# Format the generated files with prettier
echo "  → Formatting generated files with prettier..."
"$PRETTIER_BIN" --write "$OUTPUT_DIR/api-types.ts" "$OUTPUT_DIR/node-types.ts"

echo ""
echo "✅ TypeScript types generated and formatted successfully."
