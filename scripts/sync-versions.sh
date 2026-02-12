#!/bin/bash
# Synchronize version across all SDKs
# Usage: ./scripts/sync-versions.sh [new_version]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get current version from workspace Cargo.toml
CURRENT_VERSION=$(grep '^version = ' Cargo.toml | head -1 | sed 's/version = "\(.*\)"/\1/')

echo -e "${GREEN}Current version: ${CURRENT_VERSION}${NC}"

# If new version provided, update it
if [ -n "$1" ]; then
    NEW_VERSION=$1
    echo -e "${YELLOW}Updating to version: ${NEW_VERSION}${NC}"
    
    # Update workspace Cargo.toml
    sed -i.bak "s/^version = \".*\"/version = \"${NEW_VERSION}\"/" Cargo.toml
    rm Cargo.toml.bak
    
    # Update Python SDK pyproject.toml
    if [ -f python-sdk/pyproject.toml ]; then
        sed -i.bak "s/^version = \".*\"/version = \"${NEW_VERSION}\"/" python-sdk/pyproject.toml
        rm python-sdk/pyproject.toml.bak
        echo -e "${GREEN}✓ Updated Python SDK version${NC}"
    fi
    
    # Update TypeScript SDK package.json
    if [ -f typescript-sdk/package.json ]; then
        sed -i.bak "s/\"version\": \".*\"/\"version\": \"${NEW_VERSION}\"/" typescript-sdk/package.json
        rm typescript-sdk/package.json.bak
        echo -e "${GREEN}✓ Updated TypeScript SDK version${NC}"
    fi
    
    echo -e "${GREEN}✅ All versions updated to ${NEW_VERSION}${NC}"
    echo -e "${YELLOW}Don't forget to commit these changes!${NC}"
else
    # Just display current versions
    echo ""
    echo "Current versions across SDKs:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    echo -e "Workspace:   ${GREEN}${CURRENT_VERSION}${NC}"
    
    if [ -f python-sdk/pyproject.toml ]; then
        PY_VERSION=$(grep '^version = ' python-sdk/pyproject.toml | sed 's/version = "\(.*\)"/\1/')
        echo -e "Python SDK:  ${GREEN}${PY_VERSION}${NC}"
    fi
    
    if [ -f typescript-sdk/package.json ]; then
        TS_VERSION=$(grep '"version"' typescript-sdk/package.json | head -1 | sed 's/.*"version": "\(.*\)".*/\1/')
        echo -e "TypeScript SDK: ${GREEN}${TS_VERSION}${NC}"
    fi
    
    echo ""
    echo "To update all versions, run:"
    echo "  ./scripts/sync-versions.sh <new_version>"
fi

