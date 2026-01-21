.PHONY: help build test clean format lint check generate-models generate-python-models generate-python-sdk-models generate-ts-types generate-rust-models update-specs

# Environment variables with defaults for local development
export KALEIDO_API_URL ?= http://localhost:8000
export KALEIDO_NODE_URL ?= http://localhost:3001

# Default target
help:
	@echo "Kaleidoswap SDK - Development Makefile"
	@echo ""
	@echo "Building:"
	@echo "  build              - Build all components (Rust + bindings)"
	@echo "  build-rust         - Build Rust core library"
	@echo "  build-python       - Build Python bindings (uv)"
	@echo "  build-python-sdk   - Build Python SDK (pure Python)"
	@echo "  build-typescript   - Build TypeScript bindings"
	@echo ""
	@echo "Testing:"
	@echo "  test               - Run all tests"
	@echo "  test-rust          - Run Rust tests"
	@echo "  test-python        - Run Python binding tests (uv)"
	@echo "  test-python-sdk    - Run Python SDK tests"
	@echo "  test-typescript    - Run TypeScript binding tests"
	@echo ""
	@echo "Examples & Development:"
	@echo "  run-python-example - Run Python swap example (local env)"
	@echo "  run-ts-example     - Run TypeScript swap example (local env)"
	@echo "  dev-setup          - One-command setup for local development"
	@echo "  check-services     - Verify API and Node are running"
	@echo ""
	@echo "Quick Utilities:"
	@echo "  list-swaps         - List pending swaps (requires API)"
	@echo "  node-info          - Get local node information"
	@echo ""
	@echo "Code Quality:"
	@echo "  check              - Run cargo check"
	@echo "  format             - Format all code"
	@echo "  lint               - Lint all code"
	@echo "  clippy             - Run Rust clippy"
	@echo ""
	@echo "Code Generation:"
	@echo "  generate-models            - Generate all models (Python + TypeScript)"
	@echo "  generate-python-models     - Generate Python Pydantic models (bindings)"
	@echo "  generate-python-sdk-models - Generate Python SDK Pydantic models"
	@echo "  generate-ts-types          - Generate TypeScript types"
	@echo "  generate-rust-models       - Generate Rust models (Progenitor via build.rs)"
	@echo "  regenerate                 - Full regen: update-specs + generate-models + check"
	@echo "  update-specs               - Download latest OpenAPI specs"
	@echo ""
	@echo "Deployment:"
	@echo "  deploy-python      - Deploy Python bindings to PyPI"
	@echo "  deploy-python-sdk  - Deploy Python SDK to PyPI"
	@echo "  deploy-typescript  - Deploy TypeScript package to npm"
	@echo ""
	@echo "Cleanup:"
	@echo "  clean              - Clean all build artifacts"

# Directories
BINDINGS_PYTHON := bindings/python
BINDINGS_TYPESCRIPT := typescript-sdk
PYTHON_SDK := python-sdk

# ============================================================================
# Build targets
# ============================================================================

build: build-rust build-python build-typescript

build-rust:
	@echo "🦀 Building Rust core library..."
	cargo build --release --workspace --exclude kaleidoswap-python

build-python:
	@echo "🐍 Building Python bindings..."
	cd $(BINDINGS_PYTHON) && uv run maturin build --release

build-typescript:
	@echo "📦 Building TypeScript bindings..."
	cd $(BINDINGS_TYPESCRIPT) && pnpm install && pnpm run build

build-python-sdk:
	@echo "🐍 Building Python SDK..."
	cd $(PYTHON_SDK) && pip install build && python -m build

# ============================================================================
# Test targets
# ============================================================================

test: test-rust test-python test-typescript

test-rust:
	@echo "🧪 Running Rust tests..."
	cargo test --all

test-python:
	@echo "🧪 Running Python tests..."
	cd $(BINDINGS_PYTHON) && \
		uv sync --all-extras --dev && \
		uv run maturin develop --uv && \
		uv run pytest tests/ -v

test-typescript:
	@echo "🧪 Running TypeScript tests..."
	cd $(BINDINGS_TYPESCRIPT) && pnpm test

test-python-sdk:
	@echo "🧪 Running Python SDK tests..."
	cd $(PYTHON_SDK) && pip install -e ".[dev]" && pytest tests/ -v

# ============================================================================
# Example & Development targets
# ============================================================================

run-python-example: dev-python
	@echo "🐍 Running Python swap example..."
	@echo "   API URL: $(KALEIDO_API_URL)"
	@echo "   Node URL: $(KALEIDO_NODE_URL)"
	@cd $(BINDINGS_PYTHON) && uv run examples/swap_example.py

run-ts-example: dev-typescript
	@echo "📦 Running TypeScript examples..."
	@echo "   API URL: $(KALEIDO_API_URL)"
	@echo ""
	@echo "Available examples:"
	@echo "  make run-ts-hello      - Basic client setup"
	@echo "  make run-ts-quote      - Get a swap quote"
	@echo "  make run-ts-websocket  - WebSocket streaming"
	@echo ""
	@echo "Running hello example by default..."
	@cd $(BINDINGS_TYPESCRIPT) && pnpm exec tsx examples/01_hello.ts

run-ts-hello: dev-typescript
	@echo "📦 Running TypeScript hello example..."
	@cd $(BINDINGS_TYPESCRIPT) && pnpm exec tsx examples/01_hello.ts

run-ts-quote: dev-typescript
	@echo "📦 Running TypeScript quote example..."
	@cd $(BINDINGS_TYPESCRIPT) && pnpm exec tsx examples/02_get_quote.ts

run-ts-websocket: dev-typescript
	@echo "📦 Running TypeScript WebSocket example..."
	@cd $(BINDINGS_TYPESCRIPT) && pnpm exec tsx examples/03_websocket.ts

dev-setup: dev-python dev-typescript check-services
	@echo "✅ Development environment ready!"
	@echo ""
	@echo "Quick commands:"
	@echo "  make run-python-example  - Run Python example"
	@echo "  make run-ts-example      - Run TypeScript examples"
	@echo "  make run-ts-hello        - Run TypeScript hello example"
	@echo "  make run-ts-quote        - Run TypeScript quote example"
	@echo "  make check-services      - Verify services are running"


check-services:
	@echo "🔍 Checking services..."
	@echo -n "  API ($(KALEIDO_API_URL)): "
	@curl -s -o /dev/null -w "%{http_code}" $(KALEIDO_API_URL)/health 2>/dev/null | grep -q 200 && echo "✅ Running" || echo "❌ Not available"
	@echo -n "  Node ($(KALEIDO_NODE_URL)): "
	@curl -s -o /dev/null -w "%{http_code}" $(KALEIDO_NODE_URL)/nodeinfo 2>/dev/null | grep -q 200 && echo "✅ Running" || echo "❌ Not available"

# ============================================================================
# Quick Utility targets
# ============================================================================

list-swaps:
	@echo "📋 Listing pending swaps..."
	@curl -s $(KALEIDO_API_URL)/api/v1/swaps?status=pending | jq '.' || echo "Failed to fetch swaps"

node-info:
	@echo "🔑 Getting node information..."
	@curl -s $(KALEIDO_NODE_URL)/nodeinfo | jq '.' || echo "Failed to fetch node info"

# ============================================================================
# Code quality targets
# ============================================================================

check:
	@echo "🔍 Running cargo check..."
	cargo check --all

format: format-rust format-python format-typescript

format-rust:
	@echo "✨ Formatting Rust code..."
	cargo fmt --all

format-python:
	@echo "✨ Formatting Python code..."
	cd $(BINDINGS_PYTHON) && \
		uv run isort . && \
		uv run black .

format-typescript:
	@echo "✨ Formatting TypeScript code..."
	cd $(BINDINGS_TYPESCRIPT) && pnpm run format

format-python-sdk:
	@echo "✨ Formatting Python SDK code..."
	cd $(PYTHON_SDK) && ruff format kaleidoswap_sdk tests

lint: lint-rust lint-python lint-typescript

lint-rust:
	@echo "🔍 Linting Rust code..."
	cargo fmt --all -- --check

lint-python:
	@echo "🔍 Linting Python code..."
	cd $(BINDINGS_PYTHON) && \
		uv run ruff check . && \
		uv run black --check .

lint-typescript:
	@echo "🔍 Linting TypeScript code..."
	cd $(BINDINGS_TYPESCRIPT) && pnpm run lint

lint-python-sdk:
	@echo "🔍 Linting Python SDK code..."
	cd $(PYTHON_SDK) && ruff check kaleidoswap_sdk tests && mypy kaleidoswap_sdk

clippy:
	@echo "📎 Running clippy..."
	cargo clippy --all-targets -- -D warnings

# ============================================================================
# Code generation targets
# ============================================================================

generate-models: generate-python-models generate-python-sdk-models generate-ts-types
	@echo "✅ All models generated (Python bindings + Python SDK + TypeScript)"

generate-python-models:
	@echo "🐍 Generating Python Pydantic models from OpenAPI specs (bindings)..."
	bash scripts/generate_python_models.sh

generate-python-sdk-models:
	@echo "🐍 Generating Python SDK Pydantic models from OpenAPI specs..."
	bash scripts/generate_python_sdk_models.sh

generate-ts-types:
	@echo "📦 Generating TypeScript types from OpenAPI specs..."
	bash scripts/generate_typescript_types.sh

generate-rust-models:
	@echo "🔄 Generating Rust models from OpenAPI specs (Progenitor)..."
	./scripts/generate-rust-models.sh
	@echo "✅ Rust models generated via build.rs."

regenerate: update-specs generate-models check
	@echo "✅ Full regeneration complete!"

update-specs:
	@echo "📥 Updating OpenAPI specifications..."
	./scripts/update-openapi-specs.sh

# ============================================================================
# Deployment targets
# ============================================================================

deploy-python:
	@echo "📤 Deploying Python package to PyPI..."
	cd $(BINDINGS_PYTHON) && uv run maturin publish

deploy-typescript:
	@echo "📤 Deploying TypeScript package to npm..."
	cd $(BINDINGS_TYPESCRIPT) && pnpm publish

deploy-python-sdk:
	@echo "📤 Deploying Python SDK to PyPI..."
	cd $(PYTHON_SDK) && pip install build twine && python -m build && twine upload dist/*

# ============================================================================
# Clean targets
# ============================================================================

clean:
	@echo "🧹 Cleaning build artifacts..."
	cargo clean
	rm -rf target/
	rm -rf $(BINDINGS_PYTHON)/target/
	rm -rf $(BINDINGS_PYTHON)/*.egg-info/
	rm -rf $(BINDINGS_PYTHON)/dist/
	rm -rf $(PYTHON_SDK)/*.egg-info/
	rm -rf $(PYTHON_SDK)/dist/
	rm -rf $(PYTHON_SDK)/build/
	rm -rf $(BINDINGS_TYPESCRIPT)/dist/
	rm -rf $(BINDINGS_TYPESCRIPT)/node_modules/
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .pytest_cache -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .mypy_cache -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .ruff_cache -exec rm -rf {} + 2>/dev/null || true

# ============================================================================
# Development helpers
# ============================================================================

dev-python:
	@echo "🐍 Installing Python bindings in development mode..."
	cd $(BINDINGS_PYTHON) && \
		uv sync --all-extras --dev && \
		uv run maturin develop --uv

dev-typescript:
	@echo "📦 Installing TypeScript SDK dependencies..."
	cd $(BINDINGS_TYPESCRIPT) && pnpm install

dev-python-sdk:
	@echo "🐍 Installing Python SDK in development mode..."
	cd $(PYTHON_SDK) && pip install -e ".[dev]"

# Watch for changes and rebuild
watch:
	@echo "👀 Watching for changes..."
	cargo watch -x check

# Generate documentation
docs:
	@echo "📚 Generating documentation..."
	cargo doc --no-deps --open
