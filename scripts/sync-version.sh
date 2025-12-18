#!/bin/bash
# Sync version across all package manifests
# Usage: ./scripts/sync-version.sh <version>
#
# This script updates the version in:
# - Cargo.toml (workspace)
# - bindings/python/pyproject.toml
# - bindings/typescript/package.json

set -euo pipefail

VERSION="${1#v}"  # Remove leading 'v' if present

if [[ -z "$VERSION" ]]; then
    echo "Usage: $0 <version>"
    echo "Example: $0 v1.2.3"
    exit 1
fi

echo "🔄 Syncing version to: $VERSION"

# Update workspace Cargo.toml
if [[ -f "Cargo.toml" ]]; then
    if [[ "$(uname)" == "Darwin" ]]; then
        sed -i '' "s/^version = \".*\"/version = \"$VERSION\"/" Cargo.toml
    else
        sed -i "s/^version = \".*\"/version = \"$VERSION\"/" Cargo.toml
    fi
    echo "✅ Updated Cargo.toml"
fi

# Update Python pyproject.toml
if [[ -f "bindings/python/pyproject.toml" ]]; then
    if [[ "$(uname)" == "Darwin" ]]; then
        sed -i '' "s/^version = \".*\"/version = \"$VERSION\"/" bindings/python/pyproject.toml
    else
        sed -i "s/^version = \".*\"/version = \"$VERSION\"/" bindings/python/pyproject.toml
    fi
    echo "✅ Updated bindings/python/pyproject.toml"
fi

# Update TypeScript package.json
if [[ -f "bindings/typescript/package.json" ]]; then
    if command -v jq &> /dev/null; then
        jq --arg v "$VERSION" '.version = $v' bindings/typescript/package.json > tmp.json
        mv tmp.json bindings/typescript/package.json
    else
        # Fallback using sed if jq not available
        if [[ "$(uname)" == "Darwin" ]]; then
            sed -i '' "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" bindings/typescript/package.json
        else
            sed -i "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" bindings/typescript/package.json
        fi
    fi
    echo "✅ Updated bindings/typescript/package.json"
fi

echo ""
echo "✅ All versions synced to $VERSION"
