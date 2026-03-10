#!/bin/bash
# Synchronize version across active SDKs
# Usage: ./scripts/sync-versions.sh [new_version]

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [[ -f python-sdk/pyproject.toml ]]; then
    CURRENT_VERSION=$(grep '^version = ' python-sdk/pyproject.toml | head -1 | sed 's/version = "\(.*\)"/\1/')
else
    CURRENT_VERSION="unknown"
fi

echo -e "${GREEN}Current version: ${CURRENT_VERSION}${NC}"

if [[ -n "${1:-}" ]]; then
    NEW_VERSION="${1#v}"
    echo -e "${YELLOW}Updating to version: ${NEW_VERSION}${NC}"

    ./scripts/sync-version.sh "$NEW_VERSION"
else
    echo ""
    echo "Current versions across SDKs:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    if [[ -f python-sdk/pyproject.toml ]]; then
        PY_VERSION=$(grep '^version = ' python-sdk/pyproject.toml | head -1 | sed 's/version = "\(.*\)"/\1/')
        echo -e "Python SDK:      ${GREEN}${PY_VERSION}${NC}"
    fi

    if [[ -f typescript-sdk/package.json ]]; then
        TS_VERSION=$(grep '"version"' typescript-sdk/package.json | head -1 | sed 's/.*"version": "\(.*\)".*/\1/')
        echo -e "TypeScript SDK:  ${GREEN}${TS_VERSION}${NC}"
    fi

    echo ""
    echo "To update all versions, run:"
    echo "  ./scripts/sync-versions.sh <new_version>"
fi
