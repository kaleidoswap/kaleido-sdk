#!/bin/bash
# Generate Rust models from OpenAPI specifications using progenitor (build.rs)
#
# This script triggers the build process which automatically generates
# API clients and models from the specs in crates/kaleidoswap-core/specs/
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🔧 Kaleidoswap SDK - Rust Client Generator (Progenitor)"
echo "======================================================"

# Ensure specs exist
if [[ ! -f "$ROOT_DIR/crates/kaleidoswap-core/specs/maker.json" ]]; then
    echo "⚠️  Specs not found. Running update-openapi-specs.sh..."
    "$SCRIPT_DIR/update-openapi-specs.sh"
fi

# Force rebuild of build script logic if needed
# cargo clean -p kaleidoswap-core --build-script? No need usually.

echo "🔄 Triggering generation via cargo check..."
# This runs build.rs which uses progenitor to generate code in OUT_DIR
cargo check -p kaleidoswap-core

echo ""
echo "✅ Generation complete (artifacts in TARGET/OUT_DIR)."
echo "   Clients are available in 'kaleidoswap_core::generated::{maker, rln}'."
