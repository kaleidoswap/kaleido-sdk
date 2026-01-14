#!/bin/bash
# Publish all SDK bindings to their respective registries
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

# Get version
VERSION=$(grep '^version = ' Cargo.toml | head -1 | sed 's/version = "\(.*\)"/\1/')
echo -e "${BLUE}📦 Publishing Kaleidoswap SDK v${VERSION}${NC}"
echo ""

# ============================================================================
# Python (PyPI)
# ============================================================================
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🐍 Python bindings → PyPI${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd bindings/python

if [ "$DRY_RUN" = true ]; then
    echo "Would build wheel: uv run maturin build --release"
    echo "Would publish: uv run maturin publish --skip-existing"
else
    echo "Building Python wheel..."
    uv run maturin build --release
    
    echo "Publishing to PyPI..."
    read -p "Publish to PyPI? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        uv run maturin publish --skip-existing
        echo -e "${GREEN}✅ Published kaleidoswap v${VERSION} to PyPI${NC}"
    else
        echo -e "${YELLOW}⏭️  Skipped PyPI publish${NC}"
    fi
fi

cd ../..
echo ""

# ============================================================================
# Node.js (npm)
# ============================================================================
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📦 Node.js bindings → npm${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd bindings/typescript

if [ "$DRY_RUN" = true ]; then
    echo "Would build: pnpm run build"
    echo "Would publish: npm publish --access public"
else
    echo "Building Node.js bindings..."
    pnpm install
    pnpm run build
    
    echo "Publishing to npm..."
    read -p "Publish @kaleidoswap/sdk to npm? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm publish --access public
        echo -e "${GREEN}✅ Published @kaleidoswap/sdk v${VERSION} to npm${NC}"
    else
        echo -e "${YELLOW}⏭️  Skipped npm publish${NC}"
    fi
fi

cd ../..
echo ""

# ============================================================================
# WASM (npm)
# ============================================================================
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🌐 WASM bindings → npm${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd bindings/typescript

if [ "$DRY_RUN" = true ]; then
    echo "Would build: npm run build"
    echo "Would publish: npm publish --access public"
else
    echo "Building WASM bindings..."
    npm run build
    
    echo "Publishing to npm..."
    read -p "Publish @kaleidoswap/sdk to npm? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Publish from pkg directory
        cd pkg
        npm publish --access public
        cd ..
        echo -e "${GREEN}✅ Published @kaleidoswap/sdk v${VERSION} to npm${NC}"
    else
        echo -e "${YELLOW}⏭️  Skipped npm publish${NC}"
    fi
fi

cd ../..
echo ""

# ============================================================================
# Summary
# ============================================================================
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Release process complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Published packages:"
echo "  🐍 Python:     kaleidoswap v${VERSION}"
echo "  📦 Node.js:    @kaleidoswap/sdk v${VERSION}"
echo "  🌐 WASM:       @kaleidoswap/sdk v${VERSION}"
echo ""
echo "Next steps:"
echo "  1. Create GitHub release: https://github.com/kaleidoswap/kaleido-sdk/releases/new"
echo "  2. Update documentation"
echo "  3. Announce on social media"
echo ""

