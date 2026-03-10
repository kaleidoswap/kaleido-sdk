#!/bin/bash
# Publish all SDKs to their respective registries
# Usage: ./scripts/publish-all.sh [--dry-run]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

DRY_RUN=false
if [ "$1" = "--dry-run" ]; then
    DRY_RUN=true
    echo -e "${YELLOW}🔍 DRY RUN MODE - No packages will be published${NC}"
    echo ""
fi

# Get version from Python SDK manifest (single source for release script output)
VERSION=$(grep '^version = ' python-sdk/pyproject.toml | head -1 | sed 's/version = "\(.*\)"/\1/')
echo -e "${BLUE}📦 Publishing Kaleidoswap SDK v${VERSION}${NC}"
echo ""

# ============================================================================
# Python SDK (PyPI)
# ============================================================================
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🐍 Python SDK → PyPI${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd python-sdk

if [ "$DRY_RUN" = true ]; then
    echo "Would build: uv build"
    echo "Would publish: uv run twine upload dist/*"
else
    echo "Building Python SDK..."
    uv build
    
    echo "Publishing to PyPI..."
    read -p "Publish to PyPI? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        uv run twine upload dist/*
        echo -e "${GREEN}✅ Published kaleidoswap-sdk v${VERSION} to PyPI${NC}"
    else
        echo -e "${YELLOW}⏭️  Skipped PyPI publish${NC}"
    fi
fi

cd ..
echo ""

# ============================================================================
# TypeScript SDK (npm)
# ============================================================================
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📦 TypeScript SDK → npm${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd typescript-sdk

if [ "$DRY_RUN" = true ]; then
    echo "Would build: pnpm run build"
    echo "Would publish: pnpm publish"
else
    echo "Building TypeScript SDK..."
    pnpm install
    pnpm run build
    
    echo "Publishing to npm..."
    read -p "Publish @kaleidoswap/sdk to npm? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        pnpm publish
        echo -e "${GREEN}✅ Published @kaleidoswap/sdk v${VERSION} to npm${NC}"
    else
        echo -e "${YELLOW}⏭️  Skipped npm publish${NC}"
    fi
fi

cd ..
echo ""

# ============================================================================
# Summary
# ============================================================================
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Release process complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Published packages:"
echo "  🐍 Python SDK:     kaleidoswap-sdk v${VERSION}"
echo "  📦 TypeScript SDK: @kaleidoswap/sdk v${VERSION}"
echo ""
echo "Next steps:"
echo "  1. Create GitHub release: https://github.com/kaleidoswap/kaleido-sdk/releases/new"
echo "  2. Update documentation"
echo "  3. Announce on social media"
echo ""

