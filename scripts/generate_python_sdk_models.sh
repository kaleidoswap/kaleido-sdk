#!/bin/bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SPECS_DIR="$ROOT_DIR/specs"
OUTPUT_DIR="$ROOT_DIR/python-sdk/kaleidoswap_sdk/_generated"

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

# Generate from kaleidoswap.json (Kaleidoswap Market API)
echo "  → Generating from kaleidoswap.json..."
$CODEGEN_CMD \
    --input "$SPECS_DIR/kaleidoswap.json" \
    --output "$OUTPUT_DIR/api_types.py" \
    --input-file-type openapi \
    --output-model-type pydantic_v2.BaseModel \
    --use-standard-collections \
    --use-annotated \
    --use-schema-description \
    --field-constraints \
    --snake-case-field \
    --strict-nullable \
    --enum-field-as-literal one \
    --capitalise-enum-members \
    --target-python-version 3.11 \
    --use-double-quotes \
    --collapse-root-models \
    --formatters ruff-format ruff-check \
    --disable-timestamp

# Generate from rgb-lightning-node.yaml (RGB Lightning Node API)
echo "  → Generating from rgb-lightning-node.yaml..."
$CODEGEN_CMD \
    --input "$SPECS_DIR/rgb-lightning-node.yaml" \
    --output "$OUTPUT_DIR/node_types.py" \
    --input-file-type openapi \
    --output-model-type pydantic_v2.BaseModel \
    --use-standard-collections \
    --use-annotated \
    --use-schema-description \
    --use-title-as-name \
    --field-constraints \
    --snake-case-field \
    --strict-nullable \
    --enum-field-as-literal one \
    --capitalise-enum-members \
    --target-python-version 3.11 \
    --use-double-quotes \
    --collapse-root-models \
    --formatters ruff-format ruff-check \
    --disable-timestamp

# datamodel-codegen renames PaymentStatus -> PaymentStatus1 when a payment_status field exists
# in the same model (known bug: https://github.com/koxudaxi/datamodel-code-generator/issues/2091)
# if grep -q "class PaymentStatus1(" "$OUTPUT_DIR/api_types.py" 2>/dev/null; then
#     if [[ "$(uname)" == "Darwin" ]]; then
#         sed -i '' 's/PaymentStatus1/PaymentStatus/g' "$OUTPUT_DIR/api_types.py"
#     else
#         sed -i 's/PaymentStatus1/PaymentStatus/g' "$OUTPUT_DIR/api_types.py"
#     fi
#     echo "  → Fixed PaymentStatus1 → PaymentStatus"
# fi

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
