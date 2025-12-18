#!/bin/bash
# Quick Rust SDK smoke test
# This script tests the Kaleidoswap SDK by running a simple HTTP request

set -e

echo "🦀 Kaleidoswap SDK - Rust Smoke Test"
echo "====================================="

cd "$(dirname "$0")/.."

# Run the unit tests
echo ""
echo "📋 Running unit tests..."
cargo test -p kaleidoswap-core -q

echo ""
echo "✅ All tests passed!"
echo ""
echo "📝 Note: For live API testing, use the Python or TypeScript examples:"
echo "   - bindings/python/examples/market_data.py"
echo "   - bindings/typescript/examples/"
