.PHONY: \
	help \
	build build-python-sdk build-typescript \
	test test-python-sdk test-typescript \
	check check-python check-typescript \
	check-format-python check-lint-python typecheck-python \
	check-format-typescript check-lint-typescript typecheck-typescript \
	generate-models generate-python-sdk-models generate-ts-types regenerate update-specs \
	versions sync-version \
	deploy-python-sdk deploy-typescript \
	clean clean-cache distclean

.DEFAULT_GOAL := help

# Default target
help:
	@echo "Kaleidoswap SDK - Development Makefile"
	@echo ""
	@echo "Building:"
	@echo "  build              - Build all SDKs"
	@echo "  build-python-sdk   - Build Python SDK (pure Python)"
	@echo "  build-typescript   - Build TypeScript SDK"
	@echo ""
	@echo "Testing:"
	@echo "  test               - Run all tests"
	@echo "  test-python-sdk    - Run Python SDK tests"
	@echo "  test-typescript    - Run TypeScript SDK tests"
	@echo ""
	@echo "Checks:"
	@echo "  check              - Check all SDKs (format, lint, typecheck)"
	@echo "  check-python       - Check Python SDK (format, lint, typecheck)"
	@echo "  check-typescript   - Check TypeScript SDK (format, lint, typecheck)"
	@echo ""
	@echo "Code Generation:"
	@echo "  generate-models            - Generate all models (Python SDK + TypeScript)"
	@echo "  generate-python-sdk-models - Generate Python SDK Pydantic models"
	@echo "  generate-ts-types          - Generate TypeScript types"
	@echo "  regenerate                 - Full regen: update-specs + generate-models"
	@echo "  update-specs               - Download latest OpenAPI specs"
	@echo ""
	@echo "Deployment:"
	@echo "  deploy-python-sdk  - Deploy Python SDK to PyPI"
	@echo "  deploy-typescript  - Deploy TypeScript SDK to npm"
	@echo ""
	@echo "Versioning:"
	@echo "  versions           - Show current SDK versions"
	@echo "  sync-version       - Sync Python + TypeScript versions (make sync-version VERSION=X.Y.Z)"
	@echo ""
	@echo "Cleanup:"
	@echo "  clean              - Clean build artifacts"
	@echo "  clean-cache        - Clean Python cache artifacts"
	@echo "  distclean          - Clean build artifacts, caches, and node_modules"

# Directories
TYPESCRIPT_SDK := typescript-sdk
PYTHON_SDK := python-sdk

# OpenAPI spec sources and primary generated outputs (used for timestamp-based skipping)
SPECS := specs/kaleidoswap.json specs/rgb-lightning-node.yaml
PYTHON_GENERATED := python-sdk/kaleidoswap_sdk/_generated/api_types.py
TS_GENERATED     := typescript-sdk/src/generated/api-types.ts

# ============================================================================
# Build targets
# ============================================================================

build: build-python-sdk build-typescript

build-typescript:
	@echo "📦 Building TypeScript SDK..."
	cd $(TYPESCRIPT_SDK) && pnpm install && pnpm run build

build-python-sdk:
	@echo "🐍 Building Python SDK..."
	cd $(PYTHON_SDK) && uv build

# ============================================================================
# Test targets
# ============================================================================

test: test-python-sdk test-typescript

test-typescript:
	@echo "🧪 Running TypeScript SDK tests..."
	cd $(TYPESCRIPT_SDK) && pnpm install && pnpm test

test-python-sdk:
	@echo "🧪 Running Python SDK tests..."
	cd $(PYTHON_SDK) && uv sync --all-extras --dev && uv run pytest tests/ -v

# ============================================================================
# Code quality targets
# ============================================================================

<<<<<<< github
=======
format: format-python format-typescript
# Rust (not actively maintained):
# format: format-rust format-python format-typescript

# format-rust:
# 	@echo "✨ Formatting Rust code..."
# 	cargo fmt --all

format-python:
	@echo "✨ Formatting Python SDK code..."
	cd $(PYTHON_SDK) && \
		uv sync --frozen --all-extras --dev && \
		uv run ruff format kaleidoswap_sdk tests

format-typescript:
	@echo "✨ Formatting TypeScript code..."
	cd $(TYPESCRIPT_SDK) && pnpm run format

lint: lint-typescript check-python
# Rust (not actively maintained):
# lint: lint-rust lint-typescript check-python

# lint-rust:
# 	@echo "🔍 Checking Rust formatting..."
# 	cargo fmt --all -- --check

# clippy:
# 	@echo "📎 Running clippy..."
# 	cargo clippy --all-targets --all-features -- -D warnings

lint-typescript:
	@echo "🔍 Linting TypeScript code..."
	cd $(TYPESCRIPT_SDK) && pnpm run lint

lint-python:
	@echo "🛠️ Fixing Python SDK lint issues..."
	cd $(PYTHON_SDK) && \
		uv sync --frozen --extra lint && \
		uv run ruff format kaleidoswap_sdk tests && \
		uv run ruff check --fix kaleidoswap_sdk tests && \
		uv run mypy kaleidoswap_sdk --ignore-missing-imports

>>>>>>> master
check-format-python:
	@echo "🔍 Checking Python SDK formatting..."
	cd $(PYTHON_SDK) && \
		uv sync --frozen --extra lint && \
		uv run ruff format --check kaleidoswap_sdk tests

check-lint-python:
	@echo "🔍 Checking Python SDK lint..."
	cd $(PYTHON_SDK) && \
		uv sync --frozen --extra lint && \
		uv run ruff check kaleidoswap_sdk tests

typecheck-python:
	@echo "📝 Type checking Python SDK..."
	cd $(PYTHON_SDK) && \
		uv sync --frozen --extra lint && \
		uv run mypy kaleidoswap_sdk --ignore-missing-imports

check-python: check-format-python check-lint-python typecheck-python
	@echo "✅ Python SDK format, lint, and type checks passed!"

check-typescript: check-format-typescript check-lint-typescript typecheck-typescript
	@echo "✅ TypeScript SDK format, lint, and type checks passed!"

check: check-python check-typescript
	@echo ""
	@echo "✅ All SDKs passed format, lint, and type checks!"

typecheck-typescript:
	@echo "📝 Type checking TypeScript SDK..."
	cd $(TYPESCRIPT_SDK) && pnpm install && pnpm run typecheck

check-format-typescript:
	@echo "🔍 Checking TypeScript SDK formatting..."
	cd $(TYPESCRIPT_SDK) && pnpm install && pnpm run format:check

check-lint-typescript:
	@echo "🔍 Checking TypeScript SDK lint..."
	cd $(TYPESCRIPT_SDK) && pnpm install && pnpm run lint

# ============================================================================
# Code generation targets
# ============================================================================

# Force regeneration of all models regardless of timestamps (use for manual runs)
generate-models: generate-python-sdk-models generate-ts-types
	@echo "✅ All models generated (Python SDK + TypeScript)"

generate-python-sdk-models:
	@bash scripts/generate_python_sdk_models.sh

generate-ts-types:
	@bash scripts/generate_typescript_types.sh

# File-based targets: Make skips regeneration when spec files are older than outputs.
# Used exclusively by 'regenerate' — do not call directly.
$(PYTHON_GENERATED): $(SPECS) scripts/generate_python_sdk_models.sh
	@bash scripts/generate_python_sdk_models.sh

$(TS_GENERATED): $(SPECS) scripts/generate_typescript_types.sh
	@bash scripts/generate_typescript_types.sh

# Smart regenerate: update specs, then only regenerate if specs actually changed.
# Make compares spec file timestamps against generated outputs and skips if up-to-date.
regenerate: update-specs $(PYTHON_GENERATED) $(TS_GENERATED)
	@echo "✅ Full regeneration complete!"

update-specs:
	@echo "📥 Updating OpenAPI specifications..."
	@./scripts/update-openapi-specs.sh

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
# Versioning targets
# ============================================================================

versions:
	@echo "SDK versions:"
	@echo "  Python SDK:     $$(grep '^version = ' $(PYTHON_SDK)/pyproject.toml | head -1 | sed 's/version = "\(.*\)"/\1/')"
	@echo "  TypeScript SDK: $$(grep '"version"' $(TYPESCRIPT_SDK)/package.json | head -1 | sed 's/.*"version": "\(.*\)".*/\1/')"

sync-version:
	@if [ -z "$(VERSION)" ]; then \
		echo "Usage: make sync-version VERSION=X.Y.Z"; \
		exit 1; \
	fi
	@VER="$(VERSION)"; VER="$${VER#v}"; \
	echo "Updating SDK versions to $$VER"; \
	perl -i -pe "s/^version = \".*\"/version = \"$$VER\"/" $(PYTHON_SDK)/pyproject.toml; \
	perl -i -pe "s/\"version\":\s*\"[^\"]+\"/\"version\": \"$$VER\"/" $(TYPESCRIPT_SDK)/package.json; \
	echo "✅ Version synced across SDKs"; \
	$(MAKE) versions

# ============================================================================
# Clean targets
# ============================================================================

clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf $(PYTHON_SDK)/*.egg-info/
	rm -rf $(PYTHON_SDK)/dist/
	rm -rf $(PYTHON_SDK)/build/
	rm -rf $(TYPESCRIPT_SDK)/dist/

clean-cache:
	@echo "🧹 Cleaning Python cache artifacts..."
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .pytest_cache -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .mypy_cache -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .ruff_cache -exec rm -rf {} + 2>/dev/null || true

distclean: clean clean-cache
	@echo "🧹 Cleaning dependency artifacts..."
	rm -rf $(TYPESCRIPT_SDK)/node_modules/
