#!/bin/bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.."; pwd)"
SPECS_DIR="$ROOT_DIR/specs"
OUTPUT_DIR="$ROOT_DIR/typescript-sdk/src/generated"

echo "🔧 Generating TypeScript types from OpenAPI specs..."

# Resolve node: prefer the one in PATH, fail clearly if missing
if ! command -v node &> /dev/null; then
    echo "❌ node not found. Please install Node.js >= 18."
    exit 1
fi

# Resolve openapi-typescript binary: local node_modules, then global
OTS_BIN=""
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

BANNER="/**
 * AUTO-GENERATED FILE — DO NOT EDIT MANUALLY.
 *
 * Re-generate with:
 *   pnpm generate:types
 *   (or: bash scripts/generate_typescript_types.sh)
 */
"

mkdir -p "$OUTPUT_DIR"

echo "  → Generating from kaleidoswap.json → api-types.ts..."
"$OTS_BIN" "$SPECS_DIR/kaleidoswap.json" --export-type -o "$OUTPUT_DIR/api-types.ts"
TMP=$(mktemp)
printf '%s\n' "$BANNER" | cat - "$OUTPUT_DIR/api-types.ts" > "$TMP" && mv "$TMP" "$OUTPUT_DIR/api-types.ts"
echo "     ✔ Written to typescript-sdk/src/generated/api-types.ts"

echo "  → Generating from rgb-lightning-node.yaml → node-types.ts..."
"$OTS_BIN" "$SPECS_DIR/rgb-lightning-node.yaml" --export-type -o "$OUTPUT_DIR/node-types.ts"
TMP=$(mktemp)
printf '%s\n' "$BANNER" | cat - "$OUTPUT_DIR/node-types.ts" > "$TMP" && mv "$TMP" "$OUTPUT_DIR/node-types.ts"
echo "     ✔ Written to typescript-sdk/src/generated/node-types.ts"

# Format the generated files with prettier
echo "  → Formatting generated files with prettier..."
cd "$ROOT_DIR/typescript-sdk"
npx prettier --write "$OUTPUT_DIR/api-types.ts" "$OUTPUT_DIR/node-types.ts"

echo ""
echo "✅ TypeScript types generated and formatted successfully."
