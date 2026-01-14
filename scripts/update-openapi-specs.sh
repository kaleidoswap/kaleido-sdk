#!/bin/bash
# Update OpenAPI specifications from upstream sources
#
# Usage: ./scripts/update-openapi-specs.sh [options]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Configuration
SPECS_DIR="$ROOT_DIR/crates/kaleidoswap-core/specs"
BACKUP_DIR="$ROOT_DIR/crates/kaleidoswap-core/specs/backup"

# Default URLs
RGB_NODE_URL="${RGB_NODE_URL:-https://raw.githubusercontent.com/RGB-Tools/rgb-lightning-node/master/openapi.yaml}"
MAKER_SPEC_URL="${MAKER_SPEC_URL:-https://raw.githubusercontent.com/kaleidoswap/specs/main/kaleidoswap.json}"

# Parse arguments
DO_BACKUP=true
while [[ $# -gt 0 ]]; do
    case "$1" in
        --maker-url)
            MAKER_SPEC_URL="$2"
            shift 2
            ;;
        --rgb-url)
            RGB_NODE_URL="$2"
            shift 2
            ;;
        --no-backup)
            DO_BACKUP=false
            shift
            ;;
        --help)
            echo "Usage: $0 [--maker-url URL] [--rgb-url URL] [--no-backup]"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

echo "📥 Updating OpenAPI Specifications"
echo "==================================="
echo "Specs Directory: $SPECS_DIR"

mkdir -p "$SPECS_DIR"
if [[ "$DO_BACKUP" == true ]]; then
    mkdir -p "$BACKUP_DIR"
fi

download_spec() {
    local url="$1"
    local output="$2"
    local name="$3"
    
    echo ""
    echo "📦 Fetching $name..."
    echo "   URL: $url"
    
    if [[ "$DO_BACKUP" == true && -f "$output" ]]; then
        local backup_name="${BACKUP_DIR}/$(basename "$output").$(date +%Y%m%d_%H%M%S)"
        cp "$output" "$backup_name"
        echo "   Backed up to: $backup_name"
    fi
    
    if curl -fsSL "$url" -o "$output.tmp"; then
        mv "$output.tmp" "$output"
        echo "   ✅ Downloaded: $output"
    else
        echo "   ❌ Failed to download"
        rm -f "$output.tmp"
        return 1
    fi
}

# Download RGB Lightning Node spec
download_spec "$RGB_NODE_URL" "$SPECS_DIR/rln.yaml" "RGB Lightning Node API"

# Download Kaleidoswap Maker spec
download_spec "$MAKER_SPEC_URL" "$SPECS_DIR/maker.json" "Kaleidoswap Maker API"

# Patch Maker API for compatibility using Python
echo "🔧 Patching Maker API spec for compatibility..."
python3 "$SCRIPT_DIR/sanitize_maker.py" "$SPECS_DIR/maker.json"

echo ""
echo "🔧 Patching RLN API spec for compatibility..."
# Use Python script (with PyYAML via uv) to safely remove examples
if command -v uv &> /dev/null; then
    uv run --with PyYAML python3 "$SCRIPT_DIR/sanitize_rln.py" "$SPECS_DIR/rln.yaml"
else
    echo "⚠️  uv not found. Trying python3 assuming PyYAML is installed..."
    python3 "$SCRIPT_DIR/sanitize_rln.py" "$SPECS_DIR/rln.yaml" || echo "❌ Failed to sanitize RLN spec (PyYAML missing?)."
fi

echo "✅ Update complete. Run 'make generate-models' (or cargo build) to compile."
