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

# Check for maturin
if ! command -v maturin &> /dev/null; then
    echo -e "${YELLOW}Installing maturin...${NC}"
    pip3 install maturin
fi
success "maturin available"

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
grep "^version" bindings/python/pyproject.toml | head -1
node -p "require('./bindings/typescript/package.json').version" 2>/dev/null || echo "TypeScript package.json not configured"

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
# Step 4: Build UniFFI Library
# =============================================================================
step "Step 4: Building UniFFI Library"

cargo build -p kaleidoswap-uniffi --release
success "kaleidoswap-uniffi built"

# Show the built library
echo ""
echo "Built libraries:"
ls -lh target/release/libkaleidoswap* 2>/dev/null || echo "  (no library files found - may be normal on some platforms)"

# =============================================================================
# Step 5: Build Python Bindings
# =============================================================================
step "Step 5: Building Python Bindings (Maturin + UniFFI)"

cd bindings/python

# Clean previous builds
rm -rf target/wheels/*.whl 2>/dev/null || true

# Build with maturin
maturin build --release --strip

success "Python wheel built"

# Show the built wheel
echo ""
echo "Built Python wheels:"
ls -lh ../../target/wheels/*.whl 2>/dev/null || ls -lh target/wheels/*.whl 2>/dev/null || echo "  Wheels in target/wheels/"

cd "$ROOT_DIR"

# =============================================================================
# Step 6: Build TypeScript Bindings
# =============================================================================
step "Step 6: Building TypeScript Bindings"

cd bindings/typescript

# Install dependencies
npm install 2>/dev/null || echo -e "${YELLOW}npm install had issues, continuing...${NC}"

# Build TypeScript
if [[ -f "package.json" ]] && grep -q '"build"' package.json; then
    npm run build
    success "TypeScript bindings built"
else
    echo -e "${YELLOW}⚠ No TypeScript build script found, skipping build step${NC}"
fi

cd "$ROOT_DIR"

# =============================================================================
# Step 7: Run Tests
# =============================================================================
step "Step 7: Running Tests"

echo "Running Rust tests..."
cargo test -p kaleidoswap-core --release -- --test-threads=1 2>/dev/null || echo -e "${YELLOW}⚠ Some Rust tests failed or skipped${NC}"

echo ""
echo "Running Python tests..."
cd bindings/python
if [[ -d "tests" ]]; then
    pip3 install pytest 2>/dev/null || true
    python3 -m pytest tests/ -v 2>/dev/null || echo -e "${YELLOW}⚠ Some Python tests failed or skipped${NC}"
else
    echo "  No Python tests found"
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
echo "  • Python wheel:     target/wheels/"
echo "  • TypeScript build: bindings/typescript/dist/"
echo "  • Rust library:     target/release/libkaleidoswap_uniffi.*"
echo ""
echo "Next steps:"
echo "  1. To publish Python: cd bindings/python && maturin publish"
echo "  2. To publish TypeScript: cd bindings/typescript && npm publish"
echo ""
echo -e "${YELLOW}Note: Remember to revert version changes if this was just a test:${NC}"
echo "  git checkout -- Cargo.toml bindings/python/pyproject.toml"
