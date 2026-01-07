#!/bin/bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SPECS_DIR="$ROOT_DIR/crates/kaleidoswap-core/specs"
OUTPUT_DIR="$ROOT_DIR/bindings/python/python/kaleidoswap"

echo "🔧 Generating Python Pydantic models from OpenAPI specs..."

# Check if datamodel-code-generator is installed
if ! command -v datamodel-codegen &> /dev/null; then
    echo "❌ datamodel-code-generator not found. Install with: pip install datamodel-code-generator[http]"
    exit 1
fi

# Generate from maker.json (Maker API)
echo "  → Generating from maker.json..."
datamodel-codegen \
    --input "$SPECS_DIR/maker.json" \
    --output "$OUTPUT_DIR/generated_models.py" \
    --input-file-type openapi \
    --output-model-type pydantic_v2.BaseModel \
    --use-standard-collections \
    --use-schema-description \
    --use-title-as-name \
    --field-constraints \
    --snake-case-field \
    --strict-nullable

# Generate from rln.yaml (RGB Lightning Node API)
echo "  → Generating from rln.yaml..."
datamodel-codegen \
    --input "$SPECS_DIR/rln.yaml" \
    --output "$OUTPUT_DIR/rgb_node_models.py" \
    --input-file-type openapi \
    --output-model-type pydantic_v2.BaseModel \
    --use-standard-collections \
    --use-schema-description \
    --use-title-as-name \
    --field-constraints \
    --snake-case-field \
    --strict-nullable

echo "✅ Python models generated successfully"
