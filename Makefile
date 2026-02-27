.PHONY: help build test clean format lint check generate-models generate-python-sdk-models generate-ts-types generate-rust-models update-specs pre-commit pre-commit-typescript pre-commit-python-sdk typecheck-typescript typecheck-python lint-python check-format-python check-lint-python check-python

# Environment variables with defaults for local development
export KALEIDO_API_URL ?= http://localhost:8000
export KALEIDO_NODE_URL ?= http://localhost:3001

# Default target
help:
	@echo "Kaleidoswap SDK - Development Makefile"
	@echo ""
	@echo "Building:"
	@echo "  build              - Build all components (Rust + SDKs)"
	@echo "  build-rust         - Build Rust core library"
	@echo "  build-python-sdk   - Build Python SDK (pure Python)"
	@echo "  build-typescript   - Build TypeScript SDK"
	@echo ""
	@echo "Testing:"
	@echo "  test               - Run all tests"
	@echo "  test-rust          - Run Rust tests"
	@echo "  test-python-sdk    - Run Python SDK tests"
	@echo "  test-typescript    - Run TypeScript SDK tests"
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
	@echo "Pre-commit (lint, typecheck, format check, test):"
	@echo "  pre-commit              - Run all checks for both SDKs"
	@echo "  pre-commit-typescript   - Run all checks for TypeScript SDK"
	@echo "  pre-commit-python-sdk   - Run all checks for Python SDK"
	@echo ""
	@echo "Code Generation:"
	@echo "  generate-models            - Generate all models (Python SDK + TypeScript)"
	@echo "  generate-python-sdk-models - Generate Python SDK Pydantic models"
	@echo "  generate-ts-types          - Generate TypeScript types"
	@echo "  generate-rust-models       - Generate Rust models (Progenitor via build.rs)"
	@echo "  regenerate                 - Full regen: update-specs + generate-models + check"
	@echo "  update-specs               - Download latest OpenAPI specs"
	@echo ""
	@echo "Deployment:"
	@echo "  deploy-python-sdk  - Deploy Python SDK to PyPI"
	@echo "  deploy-typescript  - Deploy TypeScript SDK to npm"
	@echo ""
	@echo "Cleanup:"
	@echo "  clean              - Clean all build artifacts"

# Directories
TYPESCRIPT_SDK := typescript-sdk
PYTHON_SDK := python-sdk

# ============================================================================
# Build targets
# ============================================================================

build: build-rust build-python-sdk build-typescript

build-rust:
	@echo "🦀 Building Rust core library..."
	cargo build --release --workspace

build-typescript:
	@echo "📦 Building TypeScript SDK..."
	cd $(TYPESCRIPT_SDK) && pnpm install && pnpm run build

build-python-sdk:
	@echo "🐍 Building Python SDK..."
	cd $(PYTHON_SDK) && uv build

# ============================================================================
# Test targets
# ============================================================================

test: test-rust test-python-sdk test-typescript

test-rust:
	@echo "🧪 Running Rust tests..."
	cargo test --all

test-typescript:
	@echo "🧪 Running TypeScript SDK tests..."
	cd $(TYPESCRIPT_SDK) && pnpm test

test-python-sdk:
	@echo "🧪 Running Python SDK tests..."
	cd $(PYTHON_SDK) && uv sync --all-extras --dev && uv run pytest tests/ -v

# ============================================================================
# Example & Development targets
# ============================================================================

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
	@cd $(TYPESCRIPT_SDK) && pnpm exec tsx examples/01_hello.ts

run-ts-hello: dev-typescript
	@echo "📦 Running TypeScript hello example..."
	@cd $(TYPESCRIPT_SDK) && pnpm exec tsx examples/01_hello.ts

run-ts-quote: dev-typescript
	@echo "📦 Running TypeScript quote example..."
	@cd $(TYPESCRIPT_SDK) && pnpm exec tsx examples/02_get_quote.ts

run-ts-websocket: dev-typescript
	@echo "📦 Running TypeScript WebSocket example..."
	@cd $(TYPESCRIPT_SDK) && pnpm exec tsx examples/03_websocket.ts

dev-setup: dev-typescript check-services
	@echo "✅ Development environment ready!"
	@echo ""
	@echo "Quick commands:"
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
	@echo "✨ Formatting Python SDK code..."
	cd $(PYTHON_SDK) && \
		uv sync --frozen --all-extras --dev && \
		uv run ruff format kaleidoswap_sdk tests --exclude kaleidoswap_sdk/_generated/

format-typescript:
	@echo "✨ Formatting TypeScript code..."
	cd $(TYPESCRIPT_SDK) && pnpm run format

lint: lint-rust lint-typescript check-python

lint-rust:
	@echo "🔍 Linting Rust code..."
	cargo fmt --all -- --check

lint-typescript:
	@echo "🔍 Linting TypeScript code..."
	cd $(TYPESCRIPT_SDK) && pnpm run lint

lint-python:
	@echo "🛠️ Fixing Python SDK lint issues..."
	cd $(PYTHON_SDK) && \
		uv sync --frozen --all-extras --dev && \
		uv run ruff format kaleidoswap_sdk tests --exclude kaleidoswap_sdk/_generated/ && \
		uv run ruff check --fix kaleidoswap_sdk tests --exclude kaleidoswap_sdk/_generated/ && \
		uv run mypy kaleidoswap_sdk --ignore-missing-imports

check-format-python:
	@echo "🔍 Checking Python SDK formatting..."
	cd $(PYTHON_SDK) && \
		uv sync --frozen --all-extras --dev && \
		uv run ruff format --check kaleidoswap_sdk tests --exclude kaleidoswap_sdk/_generated/

check-lint-python:
	@echo "🔍 Checking Python SDK lint..."
	cd $(PYTHON_SDK) && \
		uv sync --frozen --all-extras --dev && \
		uv run ruff check kaleidoswap_sdk tests

typecheck-python:
	@echo "📝 Type checking Python SDK..."
	cd $(PYTHON_SDK) && \
		uv sync --frozen --all-extras --dev && \
		uv run mypy kaleidoswap_sdk --ignore-missing-imports

check-python: check-format-python check-lint-python typecheck-python
	@echo "✅ Python SDK format, lint, and type checks passed!"

clippy:
	@echo "📎 Running clippy..."
	cargo clippy --all-targets -- -D warnings

typecheck-typescript:
	@echo "📝 Type checking TypeScript SDK..."
	cd $(TYPESCRIPT_SDK) && pnpm run typecheck

# ============================================================================
# Pre-commit targets (run before committing)
# ============================================================================

pre-commit: pre-commit-typescript pre-commit-python-sdk
	@echo ""
	@echo "✅ All pre-commit checks passed!"

pre-commit-typescript:
	@echo "🔍 Running TypeScript SDK pre-commit checks..."
	@echo ""
	cd $(TYPESCRIPT_SDK) && \
		echo "  → Checking format..." && pnpm run format:check && \
		echo "  → Linting..." && pnpm run lint && \
		echo "  → Type checking..." && pnpm run typecheck && \
		echo "  → Running tests..." && pnpm test
	@echo ""
	@echo "✅ TypeScript SDK checks passed!"

pre-commit-python-sdk:
	@echo "🔍 Running Python SDK pre-commit checks..."
	@echo ""
	cd $(PYTHON_SDK) && \
		uv sync --all-extras --dev && \
		echo "  → Checking format..." && uv run ruff format --check kaleidoswap_sdk tests --exclude kaleidoswap_sdk/_generated/ && \
		echo "  → Linting..." && uv run ruff check kaleidoswap_sdk tests --exclude kaleidoswap_sdk/_generated/ && \
		echo "  → Type checking (warnings only)..." && (uv run mypy kaleidoswap_sdk --ignore-missing-imports || echo "    ⚠️  Type check warnings (non-blocking)") && \
		echo "  → Running tests (excluding integration)..." && uv run pytest tests/ -v -m "not integration"
	@echo ""
	@echo "✅ Python SDK checks passed!"

# ============================================================================
# Code generation targets
# ============================================================================

generate-models: generate-python-sdk-models generate-ts-types
	@echo "✅ All models generated (Python SDK + TypeScript)"

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

deploy-typescript:
	@echo "📤 Deploying TypeScript SDK to npm..."
	cd $(TYPESCRIPT_SDK) && pnpm publish

deploy-python-sdk:
	@echo "📤 Deploying Python SDK to PyPI..."
	cd $(PYTHON_SDK) && uv build && uv run twine upload dist/*

# ============================================================================
# Clean targets
# ============================================================================

clean:
	@echo "🧹 Cleaning build artifacts..."
	cargo clean
	rm -rf target/
	rm -rf $(PYTHON_SDK)/*.egg-info/
	rm -rf $(PYTHON_SDK)/dist/
	rm -rf $(PYTHON_SDK)/build/
	rm -rf $(TYPESCRIPT_SDK)/dist/
	rm -rf $(TYPESCRIPT_SDK)/node_modules/
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .pytest_cache -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .mypy_cache -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .ruff_cache -exec rm -rf {} + 2>/dev/null || true

# ============================================================================
# Development helpers
# ============================================================================

dev-typescript:
	@echo "📦 Installing TypeScript SDK dependencies..."
	cd $(TYPESCRIPT_SDK) && pnpm install

dev-python-sdk:
	@echo "🐍 Installing Python SDK in development mode..."
	cd $(PYTHON_SDK) && uv sync --all-extras --dev

# Watch for changes and rebuild
watch:
	@echo "👀 Watching for changes..."
	cargo watch -x check

# Generate documentation
docs:
	@echo "📚 Generating documentation..."
	cargo doc --no-deps --open
