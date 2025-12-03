#!/bin/bash
set -e

# Script to auto-generate Python SDK from OpenAPI specs
# Following best practices: separate generated code from hand-written code

echo "🔄 Generating Python SDK from OpenAPI specs..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SPECS_DIR="$PROJECT_ROOT/specs"
PYTHON_DIR="$PROJECT_ROOT/python"
GENERATED_DIR="$PYTHON_DIR/kaleidoswap_sdk/generated"

# Ensure we're in the Python directory
cd "$PYTHON_DIR"

# Check if openapi-python-client is available
if ! command -v openapi-python-client &> /dev/null && ! uv run openapi-python-client --version &> /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  openapi-python-client not found. Installing...${NC}"
    uv pip install openapi-python-client
fi

# Function to run openapi-python-client (try uv first, fallback to direct)
run_openapi_client() {
    if command -v uv &> /dev/null; then
        uv run openapi-python-client "$@"
    else
        openapi-python-client "$@"
    fi
}

echo -e "${BLUE}📦 Generating Kaleidoswap SDK (from kaleidoswap.json)...${NC}"

# Remove old generated files for Kaleidoswap
rm -rf "$GENERATED_DIR/kaleido"

# Create temp directory for generation
TEMP_KALEIDO=$(mktemp -d)

# Generate Kaleidoswap SDK
run_openapi_client generate \
    --path "$SPECS_DIR/kaleidoswap.json" \
    --output-path "$TEMP_KALEIDO" \
    --config "$PYTHON_DIR/openapi-config-kaleido.yaml"

# Move generated code to proper location
mkdir -p "$GENERATED_DIR/kaleido"
# The generator creates a package directory, we need to move its contents
GENERATED_PKG_DIR=$(find "$TEMP_KALEIDO" -type d -name "kaleidoswap_rgb_lsp_api_client" -o -name "client" | head -n 1)
if [ -z "$GENERATED_PKG_DIR" ]; then
    # If no package dir found, look for common structure
    if [ -d "$TEMP_KALEIDO/kaleidoswap_rgb_lsp_api_client" ]; then
        cp -r "$TEMP_KALEIDO/kaleidoswap_rgb_lsp_api_client/"* "$GENERATED_DIR/kaleido/"
    elif [ -d "$TEMP_KALEIDO"/*/ ]; then
        # Copy from first subdirectory
        cp -r "$TEMP_KALEIDO"/*/* "$GENERATED_DIR/kaleido/" 2>/dev/null || true
    fi
else
    cp -r "$GENERATED_PKG_DIR/"* "$GENERATED_DIR/kaleido/"
fi

# Clean up temp directory
rm -rf "$TEMP_KALEIDO"

echo -e "${GREEN}✅ Kaleidoswap SDK generated${NC}"

echo -e "${BLUE}📦 Generating RGB Lightning Node SDK (from rgb-lightning-node.yaml)...${NC}"

# Remove old generated files for RGB Node
rm -rf "$GENERATED_DIR/rgb_node"

# Create temp directory for generation
TEMP_RGB=$(mktemp -d)

# Generate RGB Node SDK
run_openapi_client generate \
    --path "$SPECS_DIR/rgb-lightning-node.yaml" \
    --output-path "$TEMP_RGB" \
    --config "$PYTHON_DIR/openapi-config-rgb.yaml"

# Move generated code to proper location
mkdir -p "$GENERATED_DIR/rgb_node"
# The generator creates a package directory, we need to move its contents
GENERATED_PKG_DIR=$(find "$TEMP_RGB" -type d -name "rgb_lightning_node_client" -o -name "client" | head -n 1)
if [ -z "$GENERATED_PKG_DIR" ]; then
    # If no package dir found, look for common structure
    if [ -d "$TEMP_RGB/rgb_lightning_node_client" ]; then
        cp -r "$TEMP_RGB/rgb_lightning_node_client/"* "$GENERATED_DIR/rgb_node/"
    elif [ -d "$TEMP_RGB"/*/ ]; then
        # Copy from first subdirectory
        cp -r "$TEMP_RGB"/*/* "$GENERATED_DIR/rgb_node/" 2>/dev/null || true
    fi
else
    cp -r "$GENERATED_PKG_DIR/"* "$GENERATED_DIR/rgb_node/"
fi

# Clean up temp directory
rm -rf "$TEMP_RGB"

echo -e "${GREEN}✅ RGB Lightning Node SDK generated${NC}"

# Add __init__.py files if missing
for dir in "$GENERATED_DIR" "$GENERATED_DIR/kaleido" "$GENERATED_DIR/rgb_node"; do
    if [ ! -f "$dir/__init__.py" ]; then
        TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
        cat > "$dir/__init__.py" << EOF
"""
⚠️ AUTO-GENERATED CODE - DO NOT EDIT MANUALLY

This code was auto-generated from OpenAPI specifications.
Generated at: $TIMESTAMP

To regenerate, run: make generate-python

Any manual changes will be lost on next generation.
Put custom code in the parent directories (not in /generated).
"""
EOF
    fi
done

echo -e "${GREEN}✨ Python SDK generation complete!${NC}"
echo ""
echo -e "${BLUE}Generated modules:${NC}"
echo "  • $GENERATED_DIR/kaleido/    - Kaleidoswap API client"
echo "  • $GENERATED_DIR/rgb_node/   - RGB Lightning Node client"
echo ""
echo -e "${YELLOW}⚠️  Remember: Generated code should not be edited manually${NC}"
echo "   Hand-written convenience methods should go in kaleidoswap_sdk/client.py"

