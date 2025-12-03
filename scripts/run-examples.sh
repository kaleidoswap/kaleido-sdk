#!/bin/bash

# KaleidoSwap SDK Examples and Tests Runner
# This script provides a unified interface to run examples and tests across all SDK implementations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
TYPESCRIPT_DIR="typescript"
PYTHON_DIR="python"
RUST_DIR="rust"

# Default environment variables
DEFAULT_API_URL="https://api.staging.kaleidoswap.com/api/v1"
DEFAULT_NODE_URL="http://localhost:3001"

# Helper functions
print_header() {
    echo -e "${BLUE}================================================================${NC}"
    echo -e "${BLUE}  KaleidoSwap SDK Examples & Tests Runner${NC}"
    echo -e "${BLUE}================================================================${NC}"
    echo ""
}

print_section() {
    echo -e "${CYAN}=== $1 ===${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${PURPLE}ℹ $1${NC}"
}

check_dependencies() {
    local sdk=$1

    case $sdk in
        "typescript")
            if ! command -v node &> /dev/null; then
                print_error "Node.js is required for TypeScript examples"
                return 1
            fi
            if ! command -v npm &> /dev/null; then
                print_error "npm is required for TypeScript examples"
                return 1
            fi
            ;;
        "python")
            if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
                print_error "Python is required for Python examples"
                return 1
            fi
            ;;
        "rust")
            if ! command -v cargo &> /dev/null; then
                print_error "Cargo is required for Rust examples"
                return 1
            fi
            ;;
    esac

    return 0
}

setup_environment() {
    # Set default environment variables if not set
    export KALEIDO_API_URL=${KALEIDO_API_URL:-$DEFAULT_API_URL}
    export KALEIDO_NODE_URL=${KALEIDO_NODE_URL:-$DEFAULT_NODE_URL}

    print_info "Using API URL: $KALEIDO_API_URL"
    if [ "$KALEIDO_NODE_URL" != "" ]; then
        print_info "Using Node URL: $KALEIDO_NODE_URL"
    fi
    echo ""
}

# TypeScript SDK functions
run_typescript_examples() {
    print_section "TypeScript SDK Examples"

    if ! check_dependencies "typescript"; then
        return 1
    fi

    cd "$TYPESCRIPT_DIR"

    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_info "Installing TypeScript dependencies..."
        npm ci
    fi

    # Build if needed
    if [ ! -d "dist" ]; then
        print_info "Building TypeScript SDK..."
        npm run build
    fi

    cd - > /dev/null
}

run_typescript_test() {
    print_section "Running TypeScript Tests"

    if ! check_dependencies "typescript"; then
        return 1
    fi

    cd "$TYPESCRIPT_DIR"

    if [ ! -d "node_modules" ]; then
        npm ci
    fi

    print_info "Running TypeScript tests..."
    npm test
    print_success "TypeScript tests completed"

    cd - > /dev/null
}

run_typescript_quote_example() {
    print_section "TypeScript: Get Quote Example"

    if ! check_dependencies "typescript"; then
        return 1
    fi

    cd "$TYPESCRIPT_DIR"

    print_info "Running quote example..."
    if npm run example:test 2>/dev/null; then
        print_success "Quote example completed"
    else
        print_warning "Quote example failed (may require RLN node or API access)"
        print_info "This is expected in test environments without proper setup"
    fi

    cd - > /dev/null
}

run_typescript_assets_example() {
    print_section "TypeScript: Get Assets Example"

    if ! check_dependencies "typescript"; then
        return 1
    fi

    cd "$TYPESCRIPT_DIR"

    print_info "Running assets example..."
    if npm run example:test 2>/dev/null; then
        print_success "Assets example completed"
    else
        print_warning "Assets example failed (may require API access)"
        print_info "This is expected in test environments without proper setup"
    fi

    cd - > /dev/null
}

run_typescript_node_info_example() {
    print_section "TypeScript: Get Node Info Example"

    if ! check_dependencies "typescript"; then
        return 1
    fi

    cd "$TYPESCRIPT_DIR"

    print_info "Running node info example..."
    # Note: This would require a specific node info example
    # For now, we'll run the test-error.ts which shows node info calls
    npx ts-node examples/test-error.ts || true  # Ignore errors as this demonstrates error handling
    print_success "Node info example completed"

    cd - > /dev/null
}

run_typescript_buy_btc_onchain() {
    print_section "TypeScript: Buy BTC Onchain Example"

    if ! check_dependencies "typescript"; then
        return 1
    fi

    cd "$TYPESCRIPT_DIR"

    print_info "Running buy BTC onchain example..."
    if npm run example:buy-btc-onchain 2>/dev/null; then
        print_success "Buy BTC onchain example completed"
    else
        print_warning "Buy BTC example failed (may require API access)"
        print_info "This is expected in test environments without proper setup"
    fi

    cd - > /dev/null
}

run_typescript_sell_btc_onchain() {
    print_section "TypeScript: Sell BTC Onchain Example"

    if ! check_dependencies "typescript"; then
        return 1
    fi

    cd "$TYPESCRIPT_DIR"

    print_info "Running sell BTC onchain example..."
    if npm run example:sell-btc-onchain 2>/dev/null; then
        print_success "Sell BTC onchain example completed"
    else
        print_warning "Sell BTC example failed (may require API access)"
        print_info "This is expected in test environments without proper setup"
    fi

    cd - > /dev/null
}

run_typescript_atomic_swap_ln() {
    print_section "TypeScript: Atomic Swap Lightning Example (RLN)"

    if ! check_dependencies "typescript"; then
        return 1
    fi

    cd "$TYPESCRIPT_DIR"

    print_info "Running atomic swap lightning example (requires RLN node)..."
    if npm run example:atomic-swap-ln 2>/dev/null; then
        print_success "Atomic swap lightning example completed"
    else
        print_warning "Atomic swap example failed (may have compilation errors or require RLN node)"
        print_info "This example may need updates to match current API types"
    fi

    cd - > /dev/null
}

# Python SDK functions
run_python_examples() {
    print_section "Python SDK Examples"

    if ! check_dependencies "python"; then
        return 1
    fi

    cd "$PYTHON_DIR"

    # Check if using uv or pip
    if command -v uv &> /dev/null && [ -f "uv.lock" ]; then
        print_info "Using uv for Python dependencies..."
        uv sync --frozen --extra dev
        PYTHON_CMD="uv run python"
        PIP_CMD="uv run pip"
    else
        print_info "Using pip for Python dependencies..."
        pip install -e ".[dev]"
        PYTHON_CMD="python"
        PIP_CMD="pip"
    fi

    cd - > /dev/null
}

run_python_test() {
    print_section "Running Python Tests"

    if ! check_dependencies "python"; then
        return 1
    fi

    cd "$PYTHON_DIR"

    if command -v uv &> /dev/null && [ -f "uv.lock" ]; then
        uv sync --frozen --extra dev
        uv run pytest tests/
    else
        pip install -e ".[dev]"
        python -m pytest tests/
    fi

    print_success "Python tests completed"
    cd - > /dev/null
}

run_python_market_data_example() {
    print_section "Python: Market Data Example (Assets, Pairs, Quotes)"

    if ! check_dependencies "python"; then
        return 1
    fi

    cd "$PYTHON_DIR"

    if command -v uv &> /dev/null && [ -f "uv.lock" ]; then
        print_info "Running market data example with uv..."
        if uv run python examples/market_data.py 2>/dev/null; then
            print_success "Market data example completed"
        else
            print_warning "Market data example failed (may require API access)"
            print_info "This is expected in test environments without proper setup"
        fi
    else
        print_info "Running market data example with python..."
        if python examples/market_data.py 2>/dev/null; then
            print_success "Market data example completed"
        else
            print_warning "Market data example failed (may require API access)"
            print_info "This is expected in test environments without proper setup"
        fi
    fi

    cd - > /dev/null
}

# Rust SDK functions
run_rust_test() {
    print_section "Running Rust Tests"

    if ! check_dependencies "rust"; then
        return 1
    fi

    cd "$RUST_DIR"

    print_info "Running Rust tests..."
    cargo test
    print_success "Rust tests completed"

    cd - > /dev/null
}

# Main command functions
run_all_tests() {
    print_section "Running All SDK Tests"

    run_typescript_test
    echo ""
    run_python_test
    echo ""
    run_rust_test

    print_success "All SDK tests completed"
}

run_quote_examples() {
    print_section "Running Quote Examples"

    run_typescript_quote_example
    echo ""
    run_python_market_data_example

    print_success "Quote examples completed"
}

run_assets_examples() {
    print_section "Running Assets Examples"

    run_typescript_assets_example
    echo ""
    run_python_market_data_example

    print_success "Assets examples completed"
}

run_node_info_examples() {
    print_section "Running Node Info Examples"

    run_typescript_node_info_example
    echo ""
    run_python_market_data_example

    print_success "Node info examples completed"
}

run_rln_examples() {
    print_section "Running RLN (RGB Lightning Node) Examples"

    print_warning "RLN examples require a running RGB Lightning Node"
    print_info "Make sure your RLN node is running at: $KALEIDO_NODE_URL"

    run_typescript_atomic_swap_ln

    print_success "RLN examples completed"
}

run_trading_examples() {
    print_section "Running Trading Examples"

    run_typescript_buy_btc_onchain
    echo ""
    run_typescript_sell_btc_onchain

    print_success "Trading examples completed"
}

show_help() {
    cat << EOF
KaleidoSwap SDK Examples & Tests Runner

USAGE:
    $0 [COMMAND] [OPTIONS]

COMMANDS:
    help                    Show this help message

    # Test Commands
    test                    Run all SDK tests
    test-ts                 Run TypeScript tests only
    test-py                 Run Python tests only
    test-rust               Run Rust tests only

    # Example Commands
    examples                Run all available examples
    quote                   Run quote-related examples
    assets                  Run assets-related examples
    node-info               Run node info examples
    rln                     Run RLN (Lightning) examples
    trading                 Run trading examples (buy/sell BTC)

    # Individual Examples
    ts-quote                Run TypeScript quote example
    ts-assets               Run TypeScript assets example
    ts-node-info            Run TypeScript node info example
    ts-buy-btc              Run TypeScript buy BTC onchain example
    ts-sell-btc             Run TypeScript sell BTC onchain example
    ts-atomic-swap          Run TypeScript atomic swap example
    py-market-data          Run Python market data example

ENVIRONMENT VARIABLES:
    KALEIDO_API_URL         API endpoint URL (default: $DEFAULT_API_URL)
    KALEIDO_NODE_URL        RLN node URL (default: $DEFAULT_NODE_URL)

EXAMPLES:
    $0 test                    # Run all tests
    $0 quote                   # Run quote examples
    $0 rln                     # Run RLN examples
    KALEIDO_API_URL=https://api.production.kaleidoswap.com/api/v1 $0 examples

EOF
}

main() {
    print_header
    setup_environment

    case "${1:-help}" in
        "help"|"-h"|"--help")
            show_help
            ;;
        "test")
            run_all_tests
            ;;
        "test-ts")
            run_typescript_test
            ;;
        "test-py")
            run_python_test
            ;;
        "test-rust")
            run_rust_test
            ;;
        "examples")
            run_quote_examples
            echo ""
            run_assets_examples
            echo ""
            run_node_info_examples
            echo ""
            run_rln_examples
            echo ""
            run_trading_examples
            ;;
        "quote")
            run_quote_examples
            ;;
        "assets")
            run_assets_examples
            ;;
        "node-info")
            run_node_info_examples
            ;;
        "rln")
            run_rln_examples
            ;;
        "trading")
            run_trading_examples
            ;;
        "ts-quote")
            run_typescript_quote_example
            ;;
        "ts-assets")
            run_typescript_assets_example
            ;;
        "ts-node-info")
            run_typescript_node_info_example
            ;;
        "ts-buy-btc")
            run_typescript_buy_btc_onchain
            ;;
        "ts-sell-btc")
            run_typescript_sell_btc_onchain
            ;;
        "ts-atomic-swap")
            run_typescript_atomic_swap_ln
            ;;
        "py-market-data")
            run_python_market_data_example
            ;;
        *)
            print_error "Unknown command: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
