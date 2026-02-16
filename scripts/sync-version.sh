#!/bin/bash
# Sync version across all package manifests
# Usage: ./scripts/sync-version.sh <version>
#
# This script updates the version in:
# - Cargo.toml (workspace)
# - python-sdk/pyproject.toml
# - typescript-sdk/package.json

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

# Update Python SDK pyproject.toml
if [[ -f "python-sdk/pyproject.toml" ]]; then
    if [[ "$(uname)" == "Darwin" ]]; then
        sed -i '' "s/^version = \".*\"/version = \"$VERSION\"/" python-sdk/pyproject.toml
    else
        sed -i "s/^version = \".*\"/version = \"$VERSION\"/" python-sdk/pyproject.toml
    fi
    echo "✅ Updated python-sdk/pyproject.toml"
fi

# Update TypeScript SDK package.json
if [[ -f "typescript-sdk/package.json" ]]; then
    if command -v jq &> /dev/null; then
        jq --arg v "$VERSION" '.version = $v' typescript-sdk/package.json > tmp.json
        mv tmp.json typescript-sdk/package.json
    else
        # Fallback using sed if jq not available
        if [[ "$(uname)" == "Darwin" ]]; then
            sed -i '' "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" typescript-sdk/package.json
        else
            sed -i "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" typescript-sdk/package.json
        fi
    fi
    echo "✅ Updated typescript-sdk/package.json"
fi

echo ""
echo "✅ All versions synced to $VERSION"
