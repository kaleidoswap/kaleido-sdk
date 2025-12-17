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
RGB_NODE_URL="${RGB_NODE_URL:-https://raw.githubusercontent.com/RGB-Tools/rgb-lightning-node/master/openapi.yaml}"

# Kaleidoswap Maker spec URL (can be overridden by CI pipeline)
# In CI, this is set to the GitLab artifacts download URL
MAKER_SPEC_URL="${SPEC_DOWNLOAD_URL:-}"

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
    # If we have a URL (from CI pipeline trigger or manual override), use it
    if [[ "$MAKER_SPEC_URL" == *".zip"* ]] || [[ "$MAKER_SPEC_URL" == *"download"* ]]; then
        # It's a GitLab artifacts URL - need to download and extract
        echo ""
        echo "📦 Fetching Kaleidoswap Maker API (from GitLab artifacts)..."
        echo "   URL: $MAKER_SPEC_URL"
        
        TEMP_DIR=$(mktemp -d)
        trap "rm -rf '$TEMP_DIR'" EXIT
        
        if curl -fsSL "$MAKER_SPEC_URL" -o "$TEMP_DIR/artifacts.zip"; then
            if unzip -q "$TEMP_DIR/artifacts.zip" -d "$TEMP_DIR"; then
                # Look for openapi.json in the extracted files
                if [[ -f "$TEMP_DIR/specs/openapi.json" ]]; then
                    if [[ "$DO_BACKUP" == true && -f "$SPECS_DIR/kaleidoswap.json" ]]; then
                        local backup_name="${BACKUP_DIR}/kaleidoswap.json.$(date +%Y%m%d_%H%M%S)"
                        cp "$SPECS_DIR/kaleidoswap.json" "$backup_name"
                        echo "   Backed up to: $backup_name"
                    fi
                    cp "$TEMP_DIR/specs/openapi.json" "$SPECS_DIR/kaleidoswap.json"
                    echo "   ✅ Extracted: $SPECS_DIR/kaleidoswap.json"
                else
                    echo "   ❌ openapi.json not found in artifacts"
                fi
            else
                echo "   ❌ Failed to extract artifacts"
            fi
        else
            echo "   ❌ Failed to download artifacts"
        fi
    else
        # Direct URL to JSON file
        download_spec "$MAKER_SPEC_URL" "$SPECS_DIR/kaleidoswap.json" "Kaleidoswap Maker API"
    fi
else
    echo ""
    echo "⚠️  No MAKER_SPEC_URL provided."
    echo "   To fetch Kaleidoswap Maker spec, either:"
    echo "   1. Set SPEC_DOWNLOAD_URL environment variable (from CI trigger)"
    echo "   2. Use --maker-url <url> argument"
    echo "   3. Manually copy kaleidoswap.json to specs/"
    
    if [[ -f "$SPECS_DIR/kaleidoswap.json" ]]; then
        echo ""
        echo "   Using existing: $SPECS_DIR/kaleidoswap.json"
    fi
fi

echo ""
echo "📋 Current specifications:"
ls -lh "$SPECS_DIR"/*.{json,yaml} 2>/dev/null || echo "   No specs found"

echo ""
echo "✅ Done! Run 'make generate-models' to regenerate Rust models."
