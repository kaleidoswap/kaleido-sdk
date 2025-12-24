#!/bin/bash
# Generate Rust models from OpenAPI specifications using openapi-generator-cli
#
# This script generates Rust code from both the Kaleidoswap and RGB Lightning Node
# OpenAPI specifications using Docker (no Java installation required).
#
# Prerequisites:
#   Docker must be installed and running
#
# Usage: ./scripts/generate-rust-models.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
SPECS_DIR="$ROOT_DIR/specs"
OUTPUT_DIR="$ROOT_DIR/crates/kaleidoswap-core/src/generated"

# Docker image for openapi-generator
GENERATOR_IMAGE="openapitools/openapi-generator-cli:latest"

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker to continue."
    exit 1
fi

echo "🔧 Kaleidoswap SDK - Rust Model Generator"
echo "=========================================="
echo "Using Docker image: $GENERATOR_IMAGE"

# Clean previous generated code
rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

# Function to run openapi-generator via Docker
generate() {
    local spec_file="$1"
    local output_name="$2"
    local package_name="$3"
    
    echo ""
    echo "📦 Generating $output_name models from $(basename "$spec_file")..."
    
    docker run --rm \
        -v "$ROOT_DIR:/workspace" \
        -w /workspace \
        "$GENERATOR_IMAGE" generate \
        -i "/workspace/specs/$(basename "$spec_file")" \
        -g rust \
        -o "/workspace/crates/kaleidoswap-core/src/generated/$output_name" \
        --additional-properties=packageName="$package_name" \
        --additional-properties=library=reqwest \
        --additional-properties=supportAsync=true \
        --global-property=models,modelDocs=false,apiDocs=false \
        2>&1 | grep -E "(Writing|Created|Generating|Error)" | head -10 || true
    
    echo "✅ $output_name models generated"
}

# Function to fix up generated module structure
fixup_module() {
    local module_dir="$1"
    local module_name="$2"
    
    if [[ ! -d "$module_dir" ]]; then
        echo "⚠️  Module directory not found: $module_dir"
        return
    fi
    
    # Move models from nested src/models to models/
    if [[ -d "$module_dir/src/models" ]]; then
        mv "$module_dir/src/models" "$module_dir/"
        rmdir "$module_dir/src" 2>/dev/null || rm -rf "$module_dir/src"
    fi
    
    # Create mod.rs for the module
    cat > "$module_dir/mod.rs" << EOF
//! Generated ${module_name} API models.
//!
//! DO NOT EDIT - Regenerate with: ./scripts/generate-rust-models.sh

pub mod models;

// Re-export all models at the module level
pub use models::*;
EOF

    # Create models/mod.rs
    local models_dir="$module_dir/models"
    if [[ -d "$models_dir" ]]; then
        # Add allow attributes to suppress warnings in generated code
        # Use inner attribute syntax (#!) to apply to the whole module
        echo "//! Generated ${module_name} API models." > "$models_dir/mod.rs"
        echo "#![allow(ambiguous_glob_reexports)]" >> "$models_dir/mod.rs"
        echo "#![allow(clippy::empty_docs)]" >> "$models_dir/mod.rs"
        echo "#![allow(clippy::derivable_impls)]" >> "$models_dir/mod.rs"
        echo "#![allow(clippy::too_many_arguments)]" >> "$models_dir/mod.rs"
        echo "" >> "$models_dir/mod.rs"
        
        # Add mod declarations and re-exports for each file
        for f in "$models_dir"/*.rs; do
            if [[ "$(basename "$f")" != "mod.rs" ]]; then
                local name=$(basename "$f" .rs)
                echo "pub mod $name;" >> "$models_dir/mod.rs"
                echo "pub use $name::*;" >> "$models_dir/mod.rs"
            fi
        done
        
        # Fix imports: replace 'use crate::models;' with '#[allow(unused_imports)] use super::*;'
        # and remove 'models::' prefixes
        for f in "$models_dir"/*.rs; do
            if [[ "$(basename "$f")" != "mod.rs" ]]; then
                # Replace import with allow attribute to suppress warnings
                sed -i '' 's/use crate::models;/#[allow(unused_imports)]\nuse super::*;/' "$f" 2>/dev/null || \
                sed -i 's/use crate::models;/#[allow(unused_imports)]\nuse super::*;/' "$f"
                sed -i '' 's/models:://g' "$f" 2>/dev/null || \
                sed -i 's/models:://g' "$f"
                
                # Convert all i32 to i64 for financial data correctness
                # This handles all integer fields regardless of OpenAPI format annotation
                sed -i '' 's/\bi32\b/i64/g' "$f" 2>/dev/null || \
                sed -i 's/\bi32\b/i64/g' "$f"
            fi
        done
    fi
    
    echo "✅ Fixed up $module_name module structure"
}

# Generate Kaleidoswap models
if [[ -f "$SPECS_DIR/kaleidoswap.json" ]]; then
    generate "$SPECS_DIR/kaleidoswap.json" "kaleidoswap" "kaleidoswap_models"
    fixup_module "$OUTPUT_DIR/kaleidoswap" "Kaleidoswap"
else
    echo "⚠️  Spec not found: $SPECS_DIR/kaleidoswap.json"
fi

# Generate RGB Lightning Node models
if [[ -f "$SPECS_DIR/rgb-lightning-node.yaml" ]]; then
    generate "$SPECS_DIR/rgb-lightning-node.yaml" "rgb_node" "rgb_node_models"
    fixup_module "$OUTPUT_DIR/rgb_node" "RGB Node"
else
    echo "⚠️  Spec not found: $SPECS_DIR/rgb-lightning-node.yaml"
fi

# Create mod.rs to re-export all generated modules
echo ""
echo "📝 Creating module exports..."
cat > "$OUTPUT_DIR/mod.rs" << 'EOF'
//! Auto-generated models from OpenAPI specifications.
//!
//! DO NOT EDIT - Regenerate with: ./scripts/generate-rust-models.sh

pub mod kaleidoswap;
pub mod rgb_node;

// Re-export commonly used types from generated modules
pub use kaleidoswap::models as kaleido;
pub use rgb_node::models as rgb;
EOF

echo "✅ Module exports created"

echo ""
echo "✅ Model generation complete!"
echo "   Output: $OUTPUT_DIR"
echo ""
echo "📋 Next steps:"
echo "   1. Run 'cargo check' to verify compilation"
echo "   2. Update crates/kaleidoswap-core/src/lib.rs to include 'mod generated;'"
