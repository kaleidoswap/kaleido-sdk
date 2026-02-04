#!/bin/bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SPECS_DIR="$ROOT_DIR/crates/kaleidoswap-core/specs"
OUTPUT_DIR="$ROOT_DIR/python-sdk/kaleidoswap_sdk/generated"

echo "🔧 Generating Python Pydantic models for kaleidoswap-sdk from OpenAPI specs..."

# Check if datamodel-code-generator is installed (try both direct command and python module)
if command -v datamodel-codegen &> /dev/null; then
    CODEGEN_CMD="datamodel-codegen"
elif python3 -m datamodel_code_generator --version &> /dev/null; then
    CODEGEN_CMD="python3 -m datamodel_code_generator"
else
    echo "❌ datamodel-code-generator not found. Install with: pip install datamodel-code-generator[http]"
    exit 1
fi

mkdir -p "$OUTPUT_DIR"

# Generate from maker.json (Kaleidoswap Market API)
echo "  → Generating from maker.json..."
$CODEGEN_CMD \
    --input "$SPECS_DIR/maker.json" \
    --output "$OUTPUT_DIR/api_types.py" \
    --input-file-type openapi \
    --output-model-type pydantic_v2.BaseModel \
    --use-standard-collections \
    --use-schema-description \
    --use-title-as-name \
    --field-constraints \
    --snake-case-field \
    --strict-nullable \
    --enum-field-as-literal one \
    --target-python-version 3.10 \
    --use-double-quotes \
    --collapse-root-models

# Generate from rln.yaml (RGB Lightning Node API)
echo "  → Generating from rln.yaml..."
$CODEGEN_CMD \
    --input "$SPECS_DIR/rln.yaml" \
    --output "$OUTPUT_DIR/node_types.py" \
    --input-file-type openapi \
    --output-model-type pydantic_v2.BaseModel \
    --use-standard-collections \
    --use-schema-description \
    --use-title-as-name \
    --field-constraints \
    --snake-case-field \
    --strict-nullable \
    --enum-field-as-literal one \
    --target-python-version 3.10 \
    --use-double-quotes \
    --collapse-root-models

# Create __init__.py to re-export types
cat > "$OUTPUT_DIR/__init__.py" << 'EOF'
"""
Auto-generated Pydantic models from OpenAPI specifications.

DO NOT EDIT MANUALLY - These files are auto-generated.
Run `make generate-python-sdk-models` to regenerate.
"""

from .api_types import *
from .node_types import *
EOF

echo "✅ Python SDK models generated successfully at $OUTPUT_DIR"
