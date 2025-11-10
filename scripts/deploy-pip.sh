#!/bin/bash
# Deploy Python SDK to PyPI
# This script builds and publishes the Python SDK to PyPI

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PYTHON_DIR="$PROJECT_ROOT/python"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting PyPI deployment...${NC}"

# Check if we're in the right directory
if [ ! -f "$PYTHON_DIR/pyproject.toml" ]; then
    echo -e "${RED}❌ Error: pyproject.toml not found in python directory${NC}"
    exit 1
fi

cd "$PYTHON_DIR"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Error: python3 is not installed${NC}"
    exit 1
fi

# Check if uv is installed
if ! command -v uv &> /dev/null; then
    echo -e "${YELLOW}⚠️  Warning: uv is not installed. Installing...${NC}"
    curl -LsSf https://astral.sh/uv/install.sh | sh
    export PATH="$HOME/.cargo/bin:$PATH"
    if ! command -v uv &> /dev/null; then
        echo -e "${RED}❌ Error: Failed to install uv${NC}"
        exit 1
    fi
fi

# Get version from pyproject.toml
# Extract version from pyproject.toml
VERSION=$(grep -E '^version\s*=' pyproject.toml | sed -E 's/^version\s*=\s*"([^"]+)".*/\1/' | sed -E "s/^version\s*=\s*'([^']+)'.*/\1/")
if [ -z "$VERSION" ]; then
    echo -e "${RED}❌ Error: Could not extract version from pyproject.toml${NC}"
    exit 1
fi
echo -e "${GREEN}📦 Current version: $VERSION${NC}"

# Check if version already exists on PyPI
if pip index versions kaleidoswap-sdk 2>/dev/null | grep -q "$VERSION"; then
    echo -e "${YELLOW}⚠️  Warning: Version $VERSION already exists on PyPI${NC}"
    read -p "Do you want to continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Deployment cancelled${NC}"
        exit 1
    fi
fi

# Clean previous builds
echo -e "${GREEN}🧹 Cleaning previous builds...${NC}"
rm -rf dist build *.egg-info

# Install dependencies
echo -e "${GREEN}📥 Installing dependencies...${NC}"
uv sync --frozen

# Run tests
echo -e "${GREEN}🧪 Running tests...${NC}"
uv run pytest tests/ || {
    echo -e "${RED}❌ Tests failed. Aborting deployment.${NC}"
    exit 1
}

# Build the project
echo -e "${GREEN}🔨 Building Python package...${NC}"
uv build

# Verify build output
if [ ! -d "dist" ] || [ -z "$(ls -A dist)" ]; then
    echo -e "${RED}❌ Error: Build output is empty${NC}"
    exit 1
fi

# Check if we should publish (dry-run by default unless PUBLISH=true)
if [ "$PUBLISH" = "true" ]; then
    echo -e "${GREEN}📤 Publishing to PyPI...${NC}"
    
    # Check for PyPI credentials
    if [ -n "$PYPI_TOKEN" ]; then
        # Use token for authentication
        uv publish --token "$PYPI_TOKEN"
    elif [ -n "$PYPI_USERNAME" ] && [ -n "$PYPI_PASSWORD" ]; then
        # Use username/password for authentication
        uv publish --username "$PYPI_USERNAME" --password "$PYPI_PASSWORD"
    else
        echo -e "${RED}❌ Error: PYPI_TOKEN or PYPI_USERNAME/PYPI_PASSWORD must be set${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Successfully published kaleidoswap-sdk@$VERSION to PyPI${NC}"
else
    echo -e "${YELLOW}ℹ️  Dry-run mode. Set PUBLISH=true to actually publish.${NC}"
    echo -e "${GREEN}✅ Build completed successfully. Ready for deployment.${NC}"
fi

echo -e "${GREEN}✨ PyPI deployment process completed!${NC}"

