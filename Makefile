.PHONY: help build test clean format lint check generate-models update-specs

# Default target
help:
	@echo "Kaleidoswap SDK - Development Makefile"
	@echo ""
	@echo "Building:"
	@echo "  build              - Build all components (Rust + bindings)"
	@echo "  build-rust         - Build Rust core library"
	@echo "  build-python       - Build Python bindings (uv)"
	@echo "  build-typescript   - Build TypeScript bindings"
	@echo ""
	@echo "Testing:"
	@echo "  test               - Run all tests"
	@echo "  test-rust          - Run Rust tests"
	@echo "  test-python        - Run Python binding tests (uv)"
	@echo "  test-typescript    - Run TypeScript binding tests"
	@echo ""
	@echo "Code Quality:"
	@echo "  check              - Run cargo check"
	@echo "  format             - Format all code"
	@echo "  lint               - Lint all code"
	@echo "  clippy             - Run Rust clippy"
	@echo ""
	@echo "Code Generation:"
	@echo "  generate-models    - Generate Rust models from OpenAPI specs (Docker)"
	@echo "  regenerate         - Full regen: update-specs + generate-models + check"
	@echo "  update-specs       - Download latest OpenAPI specs"
	@echo ""
	@echo "Deployment:"
	@echo "  deploy-python      - Deploy Python package to PyPI"
	@echo "  deploy-typescript  - Deploy TypeScript package to npm"
	@echo ""
	@echo "Cleanup:"
	@echo "  clean              - Clean all build artifacts"

# Directories
BINDINGS_PYTHON := bindings/python
BINDINGS_TYPESCRIPT := bindings/typescript

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

# ============================================================================
# Code quality targets
# ============================================================================

check:
	@echo "🔍 Running cargo check..."
	cargo check --all

format: format-rust format-python

format-rust:
	@echo "✨ Formatting Rust code..."
	cargo fmt --all

format-python:
	@echo "✨ Formatting Python code..."
	cd $(BINDINGS_PYTHON) && \
		uv run black . && \
		uv run isort .

lint: lint-rust lint-python

lint-rust:
	@echo "🔍 Linting Rust code..."
	cargo fmt --all -- --check

lint-python:
	@echo "🔍 Linting Python code..."
	cd $(BINDINGS_PYTHON) && \
		uv run ruff check . && \
		uv run black --check .

clippy:
	@echo "📎 Running clippy..."
	cargo clippy --all-targets -- -D warnings

# ============================================================================
# Code generation targets
# ============================================================================

generate-models:
	@echo "🔄 Generating Rust models from OpenAPI specs (Docker)..."
	./scripts/generate-rust-models.sh
	@echo "✅ Models generated. Run 'cargo check' to verify."

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
	rm -rf $(BINDINGS_TYPESCRIPT)/dist/
	rm -rf $(BINDINGS_TYPESCRIPT)/node_modules/
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .pytest_cache -exec rm -rf {} + 2>/dev/null || true

# ============================================================================
# Development helpers
# ============================================================================

dev-python:
	@echo "🐍 Installing Python bindings in development mode..."
	cd $(BINDINGS_PYTHON) && \
		uv sync --all-extras --dev && \
		uv run maturin develop --uv

dev-typescript:
	@echo "📦 Installing TypeScript bindings in development mode..."
	cd $(BINDINGS_TYPESCRIPT) && pnpm install && pnpm run build

# Watch for changes and rebuild
watch:
	@echo "👀 Watching for changes..."
	cargo watch -x check

# Generate documentation
docs:
	@echo "📚 Generating documentation..."
	cargo doc --no-deps --open
