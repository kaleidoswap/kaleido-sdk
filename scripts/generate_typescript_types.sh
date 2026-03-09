#!/bin/bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT="$ROOT_DIR/typescript-sdk/scripts/generate_typescript_types.mjs"

echo "🔧 Generating TypeScript types from OpenAPI specs..."

# Resolve node: prefer the one in PATH, fail clearly if missing
if ! command -v node &> /dev/null; then
    echo "❌ node not found. Please install Node.js >= 18."
    exit 1
fi

# Run the programmatic generator (handles int64 → bigint transform)
node "$SCRIPT"
