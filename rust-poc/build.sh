#!/usr/bin/env bash
#
# Build and Test Script for Rust SDK PoC
# 
# This script automates building and testing all three components:
# - Core Rust library
# - Python bindings (PyO3)
# - TypeScript bindings (NAPI-RS)
#

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Print colored output
print_step() {
    echo -e "${BLUE}==>${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check dependencies
check_dependencies() {
    print_step "Checking dependencies..."
    
    local missing_deps=()
    
    # Check Rust
    if ! command -v cargo &> /dev/null; then
        missing_deps+=("cargo (install from https://rustup.rs/)")
    fi
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        missing_deps+=("python3")
    fi
    
    # Check uv or pip (prefer uv)
    if ! command -v uv &> /dev/null && ! command -v pip3 &> /dev/null; then
        missing_deps+=("uv or pip3 (install uv from https://github.com/astral-sh/uv)")
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        missing_deps+=("node (install from https://nodejs.org/)")
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        missing_deps+=("npm")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing dependencies:"
        for dep in "${missing_deps[@]}"; do
            echo "  - $dep"
        done
        exit 1
    fi
    
    print_success "All dependencies found"
}

# Build core Rust library
build_core() {
    print_step "Building core Rust library..."
    cd kaleidoswap-core
    cargo build --release
    print_success "Core library built"
    cd ..
}

# Test core Rust library
test_core() {
    print_step "Testing core Rust library..."
    cd kaleidoswap-core
    cargo test
    print_success "Core tests passed"
    cd ..
}

# Build Python bindings
build_python() {
    print_step "Building Python bindings..."
    
    # Check if maturin is installed
    if ! command -v maturin &> /dev/null; then
        print_warning "maturin not found, installing..."
        if command -v uv &> /dev/null; then
            # Use uv tool install to install maturin globally
            uv tool install maturin
        else
            pip3 install --user maturin
        fi
    fi
    
    cd kaleidoswap-python
    maturin build --release
    print_success "Python bindings built"
    cd ..
}

# Install Python bindings in development mode
install_python() {
    print_step "Installing Python bindings in development mode..."
    cd kaleidoswap-python
    
    # Create venv if it doesn't exist
    if [ ! -d ".venv" ]; then
        print_step "Creating virtual environment..."
        if command -v uv &> /dev/null; then
            uv venv
        else
            python3 -m venv .venv
        fi
    fi
    
    # Activate and install
    source .venv/bin/activate
    maturin develop --release
    print_success "Python bindings installed in .venv"
    cd ..
}

# Build TypeScript bindings
build_typescript() {
    print_step "Building TypeScript bindings..."
    
    cd kaleidoswap-node
    
    # Check if @napi-rs/cli is installed globally
    if ! command -v napi &> /dev/null; then
        print_warning "@napi-rs/cli not found globally"
        print_step "Installing @napi-rs/cli locally..."
        npm install
        npx napi build --release
    else
        napi build --release
    fi
    
    cd ..
    print_success "TypeScript bindings built"
}

# Run Python example
run_python_example() {
    print_step "Running Python example..."
    cd examples
    python3 python_example.py
    print_success "Python example completed"
    cd ..
}

# Run TypeScript example
run_typescript_example() {
    print_step "Running TypeScript example..."
    cd examples
    
    # Check if ts-node is available
    if command -v ts-node &> /dev/null; then
        ts-node typescript_example.ts
    elif command -v npx &> /dev/null; then
        print_warning "ts-node not found, using npx..."
        npx ts-node typescript_example.ts
    else
        print_error "Cannot run TypeScript example (ts-node not found)"
        print_warning "Install with: npm install -g ts-node typescript"
        cd ..
        return 1
    fi
    
    print_success "TypeScript example completed"
    cd ..
}

# Show usage
usage() {
    cat << EOF
Usage: $0 [COMMAND]

Commands:
    check       Check all dependencies
    build       Build all components (core + bindings)
    test        Run all tests
    install-py  Install Python bindings in development mode
    examples    Run all examples
    clean       Clean build artifacts
    all         Do everything (check, build, test, examples)
    help        Show this help message

Individual component commands:
    build-core      Build only the core Rust library
    test-core       Test only the core Rust library
    build-python    Build only Python bindings
    build-ts        Build only TypeScript bindings
    run-py          Run Python example
    run-ts          Run TypeScript example

EOF
}

# Clean build artifacts
clean() {
    print_step "Cleaning build artifacts..."
    
    # Clean Rust targets
    if [ -d "target" ]; then
        rm -rf target
        print_success "Removed workspace target/"
    fi
    
    cd kaleidoswap-core
    cargo clean
    cd ..
    
    cd kaleidoswap-python
    cargo clean
    rm -rf build/ dist/ *.egg-info
    cd ..
    
    cd kaleidoswap-node
    cargo clean
    rm -rf *.node
    cd ..
    
    print_success "Clean complete"
}

# Main command dispatcher
main() {
    case "${1:-all}" in
        check)
            check_dependencies
            ;;
        build-core)
            build_core
            ;;
        test-core)
            test_core
            ;;
        build-python)
            build_python
            ;;
        build-ts)
            build_typescript
            ;;
        build)
            check_dependencies
            build_core
            build_python
            build_typescript
            ;;
        test)
            check_dependencies
            test_core
            ;;
        install-py)
            install_python
            ;;
        run-py)
            run_python_example
            ;;
        run-ts)
            run_typescript_example
            ;;
        examples)
            run_python_example
            run_typescript_example
            ;;
        clean)
            clean
            ;;
        all)
            check_dependencies
            build_core
            test_core
            build_python
            install_python
            build_typescript
            print_success "All components built successfully!"
            echo ""
            print_step "Next steps:"
            echo "  - Run Python example: ./build.sh run-py"
            echo "  - Run TypeScript example: ./build.sh run-ts"
            echo "  - Run both examples: ./build.sh examples"
            ;;
        help|--help|-h)
            usage
            ;;
        *)
            print_error "Unknown command: $1"
            echo ""
            usage
            exit 1
            ;;
    esac
}

main "$@"
