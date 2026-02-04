#!/bin/bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SPECS_DIR="$ROOT_DIR/crates/kaleidoswap-core/specs"
OUTPUT_DIR="$ROOT_DIR/python-sdk/kaleidoswap_sdk/generated"

echo "🔧 Generating Python HTTP clients from OpenAPI specs using openapi-python-client..."

# Determine the openapi-python-client command
if command -v openapi-python-client &> /dev/null; then
    OPENAPI_CMD="openapi-python-client"
elif command -v /Users/walter/Library/Python/3.9/bin/openapi-python-client &> /dev/null; then
    OPENAPI_CMD="/Users/walter/Library/Python/3.9/bin/openapi-python-client"
else
    echo "❌ openapi-python-client not found. Install with: pip3 install openapi-python-client"
    exit 1
fi

echo "  → Using: $OPENAPI_CMD"

# Clean up previous generated clients
echo "  → Cleaning up previous generated clients..."
rm -rf "$OUTPUT_DIR/maker_client_generated"
rm -rf "$OUTPUT_DIR/rln_client_generated"

# Generate maker API client
echo "  → Generating Maker API client from maker.json..."
$OPENAPI_CMD generate \
    --path "$SPECS_DIR/maker.json" \
    --output-path "$OUTPUT_DIR/maker_client_generated" \
    --meta none \
    --config "$ROOT_DIR/scripts/openapi-python-client-config.yaml"

# Generate RLN API client
echo "  → Generating RLN API client from rln.yaml..."
$OPENAPI_CMD generate \
    --path "$SPECS_DIR/rln.yaml" \
    --output-path "$OUTPUT_DIR/rln_client_generated" \
    --meta none \
    --config "$ROOT_DIR/scripts/openapi-python-client-config.yaml"

# Create __init__.py to expose generated clients
cat > "$OUTPUT_DIR/__init__.py" << 'EOF'
"""
Auto-generated API clients from OpenAPI specifications.

DO NOT EDIT MANUALLY - These files are auto-generated.
Run `make generate-python-sdk-client` to regenerate.
"""

# Re-export maker client
try:
    from .maker_client_generated.client import Client as MakerClient
    from .maker_client_generated.models import *
except ImportError:
    MakerClient = None

# Re-export RLN client
try:
    from .rln_client_generated.client import Client as RLNClient
    from .rln_client_generated.models import *
except ImportError:
    RLNClient = None

__all__ = ["MakerClient", "RLNClient"]
EOF

echo "✅ Python SDK HTTP clients generated successfully at $OUTPUT_DIR"
echo ""
echo "📝 Next steps:"
echo "   1. Review the generated clients in $OUTPUT_DIR"
echo "   2. Update your wrapper classes to use the generated clients"
echo "   3. Run tests to ensure compatibility"
