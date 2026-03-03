#!/bin/bash
# Test SDK Build Flow
# 
# This script simulates the CI pipeline flow for building Python and TypeScript
# bindings locally. It's useful for testing before pushing to GitLab.
#
# Usage: ./scripts/test-build-flow.sh [version]
# Example: ./scripts/test-build-flow.sh v1.0.0

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get version from argument or use test version
VERSION="${1:-v0.0.1-test}"
VERSION="${VERSION#v}"  # Remove leading 'v'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$ROOT_DIR"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        Kaleidoswap SDK - Local Build Flow Test               ║${NC}"
echo -e "${BLUE}║        Version: ${VERSION}                                          ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Track timing
START_TIME=$(date +%s)

# Function to print step header
step() {
    echo ""
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}▶ $1${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Function to print success
success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error
error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function to check command exists
check_command() {
    if ! command -v "$1" &> /dev/null; then
        error "$1 is not installed"
        return 1
    fi
    success "$1 found"
}

# =============================================================================
# Step 0: Check prerequisites
# =============================================================================
step "Step 0: Checking Prerequisites"

echo "Checking required tools..."
check_command rustc
check_command cargo
check_command python3
check_command pip3
check_command node
check_command npm

# =============================================================================
# Step 1: Sync Version
# =============================================================================
step "Step 1: Syncing Version to ${VERSION}"

./scripts/sync-version.sh "${VERSION}"
success "Version synced to ${VERSION}"

# Verify version was updated
echo ""
echo "Verifying version updates:"
grep "^version" Cargo.toml | head -1
grep "^version" python-sdk/pyproject.toml | head -1 2>/dev/null || echo "Python SDK pyproject.toml not found"
node -p "require('./typescript-sdk/package.json').version" 2>/dev/null || echo "TypeScript SDK package.json not configured"

# =============================================================================
# Step 2: Generate Rust Models from OpenAPI
# =============================================================================
step "Step 2: Generating Rust Models from OpenAPI Specs"

if [[ -f "specs/kaleidoswap.json" ]]; then
    python3 scripts/generate_models.py
    success "Rust models generated"
else
    echo -e "${YELLOW}⚠ No OpenAPI specs found in specs/. Skipping model generation.${NC}"
    echo "   To fetch specs, run: ./scripts/update-openapi-specs.sh --maker-url <url>"
fi

# =============================================================================
# Step 3: Build Rust Core Library
# =============================================================================
step "Step 3: Building Rust Core Library"

cargo build -p kaleidoswap-core --release
success "kaleidoswap-core built"

# =============================================================================
# Step 4: Build Python SDK
# =============================================================================
step "Step 4: Building Python SDK"

cd python-sdk

# Build with uv
if command -v uv &> /dev/null; then
    uv build
    success "Python SDK built"
else
    echo -e "${YELLOW}⚠ uv not found, skipping Python SDK build${NC}"
fi

cd "$ROOT_DIR"

# =============================================================================
# Step 5: Build TypeScript SDK
# =============================================================================
step "Step 5: Building TypeScript SDK"

cd typescript-sdk

# Install dependencies
pnpm install 2>/dev/null || echo -e "${YELLOW}pnpm install had issues, continuing...${NC}"

# Build TypeScript
if [[ -f "package.json" ]] && grep -q '"build"' package.json; then
    pnpm run build
    success "TypeScript SDK built"
else
    echo -e "${YELLOW}⚠ No TypeScript build script found, skipping build step${NC}"
fi

cd "$ROOT_DIR"

# =============================================================================
# Step 6: Run Tests
# =============================================================================
step "Step 6: Running Tests"

echo "Running Rust tests..."
cargo test -p kaleidoswap-core --release -- --test-threads=1 2>/dev/null || echo -e "${YELLOW}⚠ Some Rust tests failed or skipped${NC}"

echo ""
echo "Running Python SDK tests..."
cd python-sdk
if [[ -d "tests" ]]; then
    if command -v uv &> /dev/null; then
        uv run pytest tests/ -v 2>/dev/null || echo -e "${YELLOW}⚠ Some Python SDK tests failed or skipped${NC}"
    else
        echo -e "${YELLOW}⚠ uv not found, skipping Python SDK tests${NC}"
    fi
else
    echo "  No Python SDK tests found"
fi
cd "$ROOT_DIR"

# =============================================================================
# Summary
# =============================================================================
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                      BUILD COMPLETE                          ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✓ Version: ${VERSION}${NC}"
echo -e "${GREEN}✓ Duration: ${DURATION}s${NC}"
echo ""
echo "Artifacts:"
echo "  • Python SDK:       python-sdk/dist/"
echo "  • TypeScript SDK:   typescript-sdk/dist/"
echo ""
echo "Next steps:"
echo "  1. To publish Python SDK: cd python-sdk && uv build && uv run twine upload dist/*"
echo "  2. To publish TypeScript SDK: cd typescript-sdk && pnpm publish"
echo ""
echo -e "${YELLOW}Note: Remember to revert version changes if this was just a test:${NC}"
echo "  git checkout -- Cargo.toml python-sdk/pyproject.toml typescript-sdk/package.json"
