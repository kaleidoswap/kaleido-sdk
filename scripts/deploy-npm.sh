#!/bin/bash
# Deploy TypeScript SDK to npm
# This script builds and publishes the TypeScript SDK to npm registry

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TYPESCRIPT_DIR="$PROJECT_ROOT/typescript"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting npm deployment...${NC}"

# Check if we're in the right directory
if [ ! -f "$TYPESCRIPT_DIR/package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found in typescript directory${NC}"
    exit 1
fi

cd "$TYPESCRIPT_DIR"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ Error: npm is not installed${NC}"
    exit 1
fi

# Check if we're logged in to npm
if ! npm whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Warning: Not logged in to npm. Attempting to login...${NC}"
    echo "Please ensure NPM_TOKEN environment variable is set or login manually"
    if [ -z "$NPM_TOKEN" ]; then
        echo -e "${RED}❌ Error: NPM_TOKEN environment variable is not set${NC}"
        exit 1
    fi
    echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > ~/.npmrc
fi

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")
echo -e "${GREEN}📦 Current version: $VERSION${NC}"

# Check if version already exists on npm
if npm view "kaleidoswap-sdk@$VERSION" version &> /dev/null; then
    echo -e "${YELLOW}⚠️  Warning: Version $VERSION already exists on npm${NC}"
    read -p "Do you want to continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Deployment cancelled${NC}"
        exit 1
    fi
fi

# Clean previous builds
echo -e "${GREEN}🧹 Cleaning previous builds...${NC}"
rm -rf dist node_modules/.cache

# Install dependencies
echo -e "${GREEN}📥 Installing dependencies...${NC}"
if [ -f "package-lock.json" ]; then
    npm ci
else
    npm install
fi

# Run tests
echo -e "${GREEN}🧪 Running tests...${NC}"
npm test || {
    echo -e "${RED}❌ Tests failed. Aborting deployment.${NC}"
    exit 1
}

# Build the project
echo -e "${GREEN}🔨 Building TypeScript project...${NC}"
npm run build

# Verify build output
if [ ! -d "dist" ] || [ -z "$(ls -A dist)" ]; then
    echo -e "${RED}❌ Error: Build output is empty${NC}"
    exit 1
fi

# Check if we should publish (dry-run by default unless PUBLISH=true)
if [ "$PUBLISH" = "true" ]; then
    echo -e "${GREEN}📤 Publishing to npm...${NC}"
    
    # Determine tag (latest or beta/alpha based on version)
    if [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        TAG="latest"
    elif [[ "$VERSION" =~ -beta ]]; then
        TAG="beta"
    elif [[ "$VERSION" =~ -alpha ]]; then
        TAG="alpha"
    else
        TAG="latest"
    fi
    
    npm publish --tag "$TAG" --access public
    
    echo -e "${GREEN}✅ Successfully published kaleidoswap-sdk@$VERSION to npm with tag: $TAG${NC}"
else
    echo -e "${YELLOW}ℹ️  Dry-run mode. Set PUBLISH=true to actually publish.${NC}"
    echo -e "${GREEN}✅ Build completed successfully. Ready for deployment.${NC}"
fi

echo -e "${GREEN}✨ npm deployment process completed!${NC}"

