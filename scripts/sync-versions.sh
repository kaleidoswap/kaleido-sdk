#!/bin/bash
# Synchronize version across all SDK bindings
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
    
    # Update Python pyproject.toml
    if [ -f bindings/python/pyproject.toml ]; then
        sed -i.bak "s/^version = \".*\"/version = \"${NEW_VERSION}\"/" bindings/python/pyproject.toml
        rm bindings/python/pyproject.toml.bak
        echo -e "${GREEN}✓ Updated Python version${NC}"
    fi
    
    # Update Node.js package.json
    if [ -f bindings/typescript/package.json ]; then
        sed -i.bak "s/\"version\": \".*\"/\"version\": \"${NEW_VERSION}\"/" bindings/typescript/package.json
        rm bindings/typescript/package.json.bak
        echo -e "${GREEN}✓ Updated Node.js version${NC}"
    fi
    
    # Update Web package.json
    if [ -f bindings/web/package.json ]; then
        sed -i.bak "s/\"version\": \".*\"/\"version\": \"${NEW_VERSION}\"/" bindings/web/package.json
        rm bindings/web/package.json.bak
        echo -e "${GREEN}✓ Updated Web version${NC}"
    fi
    
    echo -e "${GREEN}✅ All versions updated to ${NEW_VERSION}${NC}"
    echo -e "${YELLOW}Don't forget to commit these changes!${NC}"
else
    # Just display current versions
    echo ""
    echo "Current versions across bindings:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    echo -e "Workspace:   ${GREEN}${CURRENT_VERSION}${NC}"
    
    if [ -f bindings/python/pyproject.toml ]; then
        PY_VERSION=$(grep '^version = ' bindings/python/pyproject.toml | sed 's/version = "\(.*\)"/\1/')
        echo -e "Python:      ${GREEN}${PY_VERSION}${NC}"
    fi
    
    if [ -f bindings/typescript/package.json ]; then
        TS_VERSION=$(grep '"version"' bindings/typescript/package.json | head -1 | sed 's/.*"version": "\(.*\)".*/\1/')
        echo -e "Node.js:     ${GREEN}${TS_VERSION}${NC}"
    fi
    
    if [ -f bindings/web/package.json ]; then
        WEB_VERSION=$(grep '"version"' bindings/web/package.json | head -1 | sed 's/.*"version": "\(.*\)".*/\1/')
        echo -e "Web:         ${GREEN}${WEB_VERSION}${NC}"
    fi
    
    echo ""
    echo "To update all versions, run:"
    echo "  ./scripts/sync-versions.sh <new_version>"
fi

