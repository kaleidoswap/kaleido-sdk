#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SPECS_DIR="$ROOT_DIR/specs"
OUTPUT_DIR="$ROOT_DIR/python-sdk/kaleidoswap_sdk/_generated"

echo "🔧 Generating Python Pydantic models for kaleidoswap-sdk from OpenAPI specs..."

# Validate spec files exist
for spec in "$SPECS_DIR/kaleidoswap.json" "$SPECS_DIR/rgb-lightning-node.yaml"; do
    [ -f "$spec" ] || { echo "❌ Missing spec file: $spec"; exit 1; }
done

# Resolve datamodel-code-generator: direct command or python module
if command -v datamodel-codegen &> /dev/null; then
    CODEGEN_CMD="datamodel-codegen"
elif python3 -m datamodel_code_generator --version &> /dev/null; then
    CODEGEN_CMD="python3 -m datamodel_code_generator"
else
    echo "❌ datamodel-code-generator not found."
    echo "   Install with: pip install datamodel-code-generator[http]"
    exit 1
fi

mkdir -p "$OUTPUT_DIR"

generate_model() {
    if [ "$#" -lt 2 ]; then
        echo "❌ generate_model requires at least 2 arguments: input and output paths" >&2
        return 1
    fi

    local input="$1" output="$2"; shift 2
    echo "  → Generating from $(basename "$input")..."

    # Base arguments for datamodel-code-generator
    local args=(
        --input "$input"
        --output "$output"
        --input-file-type openapi
        --output-model-type pydantic_v2.BaseModel
        --use-standard-collections
        --use-annotated
        --use-schema-description
        --field-constraints
        --snake-case-field
        --strict-nullable
        --enum-field-as-literal one
        --capitalise-enum-members
        --target-python-version 3.11
        --use-double-quotes
        --collapse-root-models
        --formatters ruff-format ruff-check
        --disable-timestamp
    )

    # Append any additional options, if provided
    if [ "$#" -gt 0 ]; then
        args+=("$@")
    fi

    $CODEGEN_CMD "${args[@]}"
    echo "     ✔ Written to ${output#$ROOT_DIR/}"
}

generate_model "$SPECS_DIR/kaleidoswap.json"        "$OUTPUT_DIR/api_types.py"
generate_model "$SPECS_DIR/rgb-lightning-node.yaml" "$OUTPUT_DIR/node_types.py" --use-title-as-name

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

echo ""
echo "✅ Python SDK models generated successfully at $OUTPUT_DIR"
