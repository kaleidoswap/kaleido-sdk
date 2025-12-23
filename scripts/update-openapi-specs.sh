#!/bin/bash
# Update OpenAPI specifications from upstream sources
#
# Usage: ./scripts/update-openapi-specs.sh [options]
#
# Options:
#   --maker-url URL    Override the Kaleidoswap Maker spec URL
#   --rgb-url URL      Override the RGB Lightning Node spec URL
#   --no-backup        Skip backing up existing specs
#   --help             Show this help message

set -euo pipefail

# Configuration
SPECS_DIR="specs"
BACKUP_DIR="specs/backup"

# Default URLs
# RGB Lightning Node spec (from upstream GitHub)
RGB_NODE_URL="${RGB_NODE_URL:-https://raw.githubusercontent.com/RGB-Tools/rgb-lightning-node/master/openapi.yaml}"

# Kaleidoswap Maker spec (from dedicated specs repository)
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
            head -20 "$0" | tail -12
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

# Create directories
mkdir -p "$SPECS_DIR"
if [[ "$DO_BACKUP" == true ]]; then
    mkdir -p "$BACKUP_DIR"
fi

# Function to download and validate a spec
download_spec() {
    local url="$1"
    local output="$2"
    local name="$3"
    
    echo ""
    echo "📦 Fetching $name..."
    echo "   URL: $url"
    
    # Backup existing file
    if [[ "$DO_BACKUP" == true && -f "$output" ]]; then
        local backup_name="${BACKUP_DIR}/$(basename "$output").$(date +%Y%m%d_%H%M%S)"
        cp "$output" "$backup_name"
        echo "   Backed up to: $backup_name"
    fi
    
    # Download
    if curl -fsSL "$url" -o "$output.tmp"; then
        # Validate JSON/YAML
        if [[ "$output" == *.json ]]; then
            if python3 -c "import json; json.load(open('$output.tmp'))" 2>/dev/null; then
                mv "$output.tmp" "$output"
                echo "   ✅ Downloaded and validated: $output"
                return 0
            else
                echo "   ❌ Invalid JSON received"
                rm -f "$output.tmp"
                return 1
            fi
        elif [[ "$output" == *.yaml ]] || [[ "$output" == *.yml ]]; then
            # Try to validate YAML if PyYAML is available, otherwise just check it's not empty
            if python3 -c "import yaml" 2>/dev/null; then
                if python3 -c "import yaml; yaml.safe_load(open('$output.tmp'))" 2>/dev/null; then
                    mv "$output.tmp" "$output"
                    echo "   ✅ Downloaded and validated: $output"
                    return 0
                else
                    echo "   ❌ Invalid YAML received"
                    rm -f "$output.tmp"
                    return 1
                fi
            else
                # PyYAML not available - do basic validation (check for openapi: key)
                if grep -q "^openapi:" "$output.tmp" 2>/dev/null; then
                    mv "$output.tmp" "$output"
                    echo "   ✅ Downloaded (basic validation): $output"
                    return 0
                else
                    echo "   ❌ Does not appear to be a valid OpenAPI spec"
                    rm -f "$output.tmp"
                    return 1
                fi
            fi
        else
            mv "$output.tmp" "$output"
            echo "   ✅ Downloaded: $output"
            return 0
        fi
    else
        echo "   ❌ Failed to download"
        rm -f "$output.tmp"
        return 1
    fi
}

# Download RGB Lightning Node spec (always available from GitHub)
download_spec "$RGB_NODE_URL" "$SPECS_DIR/rgb-lightning-node.yaml" "RGB Lightning Node API"

# Download Kaleidoswap Maker spec
if [[ -n "$MAKER_SPEC_URL" ]]; then
    # Use provided URL (from environment or command line)
    download_spec "$MAKER_SPEC_URL" "$SPECS_DIR/kaleidoswap.json" "Kaleidoswap Maker API"
else
    # Use default GitHub specs repository
    echo ""
    echo "📦 Fetching Kaleidoswap Maker API from specs repository..."
    download_spec "https://raw.githubusercontent.com/kaleidoswap/specs/main/kaleidoswap.json" \
        "$SPECS_DIR/kaleidoswap.json" "Kaleidoswap Maker API"
fi

echo ""
echo "📋 Current specifications:"
ls -lh "$SPECS_DIR"/*.{json,yaml} 2>/dev/null || echo "   No specs found"

echo ""
echo "✅ Done! Run 'make generate-models' to regenerate Rust models."
