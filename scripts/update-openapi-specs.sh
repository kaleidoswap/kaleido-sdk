#!/bin/bash
# Update OpenAPI specifications from upstream sources
#
# Usage: ./scripts/update-openapi-specs.sh [options]

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Configuration
SPECS_DIR="$ROOT_DIR/specs"
BACKUP_DIR="$ROOT_DIR/specs/backup"

# Default URLs
RGB_NODE_URL="${RGB_NODE_URL:-https://raw.githubusercontent.com/RGB-Tools/rgb-lightning-node/master/openapi.yaml}"
MAKER_SPEC_URL="${MAKER_SPEC_URL:-https://raw.githubusercontent.com/kaleidoswap/specs/main/kaleidoswap.json}"

# Parse arguments
DO_BACKUP=true
CHANGED=false
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
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --maker-url URL   Override the Kaleidoswap Maker API spec URL"
            echo "  --rgb-url URL     Override the RGB Lightning Node API spec URL"
            echo "  --no-backup       Skip backing up existing specs before overwriting"
            echo "  --help            Display this help message"
            exit 0
            ;;
        *)
            echo "❌ Unknown option: $1"
            exit 1
            ;;
    esac
done

echo "📥 Updating OpenAPI Specifications"
echo "==================================="
echo "   Specs Directory:  $SPECS_DIR"
[[ "$DO_BACKUP" == true ]] && echo "   Backup Directory: $BACKUP_DIR"

mkdir -p "$SPECS_DIR"
if [[ "$DO_BACKUP" == true ]]; then
    mkdir -p "$BACKUP_DIR"
fi

download_spec() {
    local url="$1"
    local output="$2"
    local name="$3"

    echo ""
    echo "  → Fetching $name..."
    echo "     URL: $url"

    local old_hash=""
    [[ -f "$output" ]] && old_hash=$(shasum "$output" | cut -d' ' -f1)

    if curl -fsSL "$url" -o "$output.tmp"; then
        local new_hash; new_hash=$(shasum "$output.tmp" | cut -d' ' -f1)
        if [[ "$old_hash" == "$new_hash" ]]; then
            rm -f "$output.tmp"
            echo "     ↔ No changes detected"
        else
            if [[ "$DO_BACKUP" == true && -f "$output" ]]; then
                local backup_name="${BACKUP_DIR}/$(basename "$output").$(date +%Y%m%d_%H%M%S)"
                cp "$output" "$backup_name"
                echo "     Backed up to: $(basename "$backup_name")"
            fi
            mv "$output.tmp" "$output"
            CHANGED=true
            echo "     ✔ Updated: ${output#$ROOT_DIR/}"
        fi
    else
        echo "     ❌ Failed to download $name"
        rm -f "$output.tmp"
        exit 1
    fi
}

# Download RGB Lightning Node spec
download_spec "$RGB_NODE_URL" "$SPECS_DIR/rgb-lightning-node.yaml" "RGB Lightning Node API"

# Download Kaleidoswap Maker spec
download_spec "$MAKER_SPEC_URL" "$SPECS_DIR/kaleidoswap.json" "Kaleidoswap Maker API"

echo ""
if [[ "$CHANGED" == true ]]; then
    echo "✅ Specs updated. Run 'make generate-models' to regenerate."
else
    echo "✅ All specs are up-to-date. No regeneration needed."
fi
