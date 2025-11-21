.PHONY: help build test clean format lint lint-fix format-lint examples deploy-npm deploy-pip deploy-all version-bump-npm version-bump-pip version-bump-all generate generate-typescript generate-python update-specs

# Default target
help:
	@echo "Kaleidoswap SDK - Deployment Makefile"
	@echo ""
	@echo "Available targets:"
	@echo "  help              - Show this help message"
	@echo "  generate          - Generate SDK code from OpenAPI specs (both TS & Python)"
	@echo "  generate-typescript - Generate TypeScript SDK from OpenAPI specs"
	@echo "  generate-python   - Generate Python SDK from OpenAPI specs"
	@echo "  update-specs      - Download/update OpenAPI specs from remote sources"
	@echo "  build             - Build both TypeScript and Python SDKs"
	@echo "  build-npm         - Build TypeScript SDK only"
	@echo "  build-pip         - Build Python SDK only"
	@echo "  test              - Run tests for both SDKs"
	@echo "  test-npm          - Run TypeScript SDK tests"
	@echo "  test-pip          - Run Python SDK tests"
	@echo "  examples          - Run SDK examples and demos"
	@echo "  clean             - Clean build artifacts for both SDKs"
	@echo "  clean-npm         - Clean TypeScript SDK build artifacts"
	@echo "  clean-pip         - Clean Python SDK build artifacts"
	@echo "  format            - Format code for all SDKs"
	@echo "  format-npm        - Format TypeScript SDK code"
	@echo "  format-pip        - Format Python SDK code"
	@echo "  format-rust       - Format Rust SDK code"
	@echo "  lint              - Lint code for all SDKs"
	@echo "  lint-npm          - Lint TypeScript SDK code"
	@echo "  lint-pip          - Lint Python SDK code"
	@echo "  lint-rust         - Lint Rust SDK code"
	@echo "  lint-fix          - Lint and auto-fix issues for all SDKs"
	@echo "  lint-fix-npm      - Lint and auto-fix TypeScript SDK code"
	@echo "  lint-fix-pip      - Lint and auto-fix Python SDK code"
	@echo "  format-lint       - Format and lint all SDKs"
	@echo "  deploy-npm        - Deploy TypeScript SDK to npm (dry-run)"
	@echo "  deploy-npm-publish - Deploy TypeScript SDK to npm (publish)"
	@echo "  deploy-pip        - Deploy Python SDK to PyPI (dry-run)"
	@echo "  deploy-pip-publish - Deploy Python SDK to PyPI (publish)"
	@echo "  deploy-all        - Deploy both SDKs (dry-run)"
	@echo "  deploy-all-publish - Deploy both SDKs (publish)"
	@echo "  version-bump-npm  - Bump version in TypeScript package.json"
	@echo "  version-bump-pip  - Bump version in Python pyproject.toml"
	@echo "  version-bump-all  - Bump version in both SDKs"
	@echo ""
	@echo "Environment variables:"
	@echo "  VERSION           - Version to set (e.g., VERSION=1.0.0)"
	@echo "  NPM_TOKEN         - npm authentication token"
	@echo "  PYPI_TOKEN        - PyPI authentication token"
	@echo "  PYPI_USERNAME     - PyPI username"
	@echo "  PYPI_PASSWORD     - PyPI password"
	@echo "  PUBLISH           - Set to 'true' to actually publish (default: false)"

# Directories
TYPESCRIPT_DIR := typescript
PYTHON_DIR := python
RUST_DIR := rust
SCRIPTS_DIR := scripts

# Code Generation targets
generate: generate-typescript generate-python

generate-typescript:
	@echo "🔄 Generating TypeScript SDK from OpenAPI specs..."
	@bash $(SCRIPTS_DIR)/generate-typescript.sh

generate-python:
	@echo "🔄 Generating Python SDK from OpenAPI specs..."
	@bash $(SCRIPTS_DIR)/generate-python.sh

update-specs:
	@echo "📥 Updating OpenAPI specifications from remote sources..."
	@bash $(SCRIPTS_DIR)/update-openapi-specs.sh

# Build targets
build: build-npm build-pip

build-npm:
	@echo "🔨 Building TypeScript SDK..."
	cd $(TYPESCRIPT_DIR) && npm ci && npm run build

build-pip:
	@echo "🔨 Building Python SDK..."
	cd $(PYTHON_DIR) && \
		if [ -f uv.lock ]; then \
			uv sync --frozen --extra dev && uv build; \
		else \
			uv sync --extra dev && uv build; \
		fi

# Test targets
test: test-npm test-pip

test-npm:
	@echo "🧪 Running TypeScript SDK tests..."
	cd $(TYPESCRIPT_DIR) && npm test

test-pip:
	@echo "🧪 Running Python SDK tests..."
	cd $(PYTHON_DIR) && \
		if [ -f uv.lock ]; then \
			uv sync --frozen --extra dev && uv run pytest tests/; \
		else \
			uv sync --extra dev && uv run pytest tests/; \
		fi

test-python-api-only:
	@echo "🧪 Running Python SDK API-only tests..."
	cd $(PYTHON_DIR) && \
		if [ -f uv.lock ]; then \
			uv sync --frozen --extra dev && uv run pytest tests/ -m api_only; \
		else \
			uv sync --extra dev && uv run pytest tests/ -m api_only; \
		fi

# Examples target
examples:
	@echo "🚀 Running KaleidoSwap SDK examples..."
	@bash $(SCRIPTS_DIR)/run-examples.sh examples

# Clean targets
clean: clean-npm clean-pip

clean-npm:
	@echo "🧹 Cleaning TypeScript SDK build artifacts..."
	cd $(TYPESCRIPT_DIR) && rm -rf dist node_modules/.cache

clean-pip:
	@echo "🧹 Cleaning Python SDK build artifacts..."
	cd $(PYTHON_DIR) && rm -rf dist build *.egg-info

# Format targets
format: format-npm format-pip format-rust

format-npm:
	@echo "✨ Formatting TypeScript SDK..."
	cd $(TYPESCRIPT_DIR) && npm ci && npm run format

format-pip:
	@echo "✨ Formatting Python SDK..."
	cd $(PYTHON_DIR) && \
		if [ -f uv.lock ]; then \
			uv sync --frozen --extra dev && \
			uv run ruff format . && \
			uv run black .; \
		else \
			uv sync --extra dev && \
			uv run ruff format . && \
			uv run black .; \
		fi

format-rust:
	@echo "✨ Formatting Rust SDK..."
	cd $(RUST_DIR) && cargo fmt

# Lint targets
lint: lint-npm lint-pip lint-rust

lint-npm:
	@echo "🔍 Linting TypeScript SDK..."
	cd $(TYPESCRIPT_DIR) && npm ci && npm run lint && npm run format:check

lint-pip:
	@echo "🔍 Linting Python SDK..."
	cd $(PYTHON_DIR) && \
		if [ -f uv.lock ]; then \
			uv sync --frozen --extra dev && \
			uv run ruff check . && \
			uv run ruff format --check . && \
			uv run black --check .; \
		else \
			uv sync --extra dev && \
			uv run ruff check . && \
			uv run ruff format --check . && \
			uv run black --check .; \
		fi

lint-rust:
	@echo "🔍 Linting Rust SDK..."
	cd $(RUST_DIR) && cargo fmt -- --check && cargo clippy --all-targets -- -D warnings

# Lint and fix targets
lint-fix: lint-fix-npm lint-fix-pip

lint-fix-npm:
	@echo "🔧 Linting and fixing TypeScript SDK..."
	cd $(TYPESCRIPT_DIR) && npm ci && npm run lint:fix && npm run format

lint-fix-pip:
	@echo "🔧 Linting and fixing Python SDK..."
	cd $(PYTHON_DIR) && \
		if [ -f uv.lock ]; then \
			uv sync --frozen --extra dev && \
			uv run ruff check --fix . && \
			uv run ruff format . && \
			uv run black .; \
		else \
			uv sync --extra dev && \
			uv run ruff check --fix . && \
			uv run ruff format . && \
			uv run black .; \
		fi

# Format and lint targets
format-lint: format lint

# Deployment targets (dry-run)
deploy-npm:
	@echo "📦 Deploying TypeScript SDK to npm (dry-run)..."
	@bash $(SCRIPTS_DIR)/deploy-npm.sh

deploy-pip:
	@echo "📦 Deploying Python SDK to PyPI (dry-run)..."
	@bash $(SCRIPTS_DIR)/deploy-pip.sh

deploy-all: deploy-npm deploy-pip

# Deployment targets (publish)
deploy-npm-publish:
	@echo "📤 Publishing TypeScript SDK to npm..."
	@PUBLISH=true bash $(SCRIPTS_DIR)/deploy-npm.sh

deploy-pip-publish:
	@echo "📤 Publishing Python SDK to PyPI..."
	@PUBLISH=true bash $(SCRIPTS_DIR)/deploy-pip.sh

deploy-all-publish: deploy-npm-publish deploy-pip-publish

# Version bump targets
version-bump-npm:
	@if [ -z "$(VERSION)" ]; then \
		echo "❌ Error: VERSION variable is required (e.g., make version-bump-npm VERSION=1.0.0)"; \
		exit 1; \
	fi
	@echo "📝 Bumping version in TypeScript package.json to $(VERSION)..."
	@cd $(TYPESCRIPT_DIR) && npm version $(VERSION) --no-git-tag-version
	@echo "✅ Version updated to $(VERSION)"

version-bump-pip:
	@if [ -z "$(VERSION)" ]; then \
		echo "❌ Error: VERSION variable is required (e.g., make version-bump-pip VERSION=1.0.0)"; \
		exit 1; \
	fi
	@echo "📝 Bumping version in Python pyproject.toml to $(VERSION)..."
	@cd $(PYTHON_DIR) && \
		if [ "$$(uname)" = "Darwin" ]; then \
			sed -i '' "s/^version = \".*\"/version = \"$(VERSION)\"/" pyproject.toml; \
		else \
			sed -i.bak "s/^version = \".*\"/version = \"$(VERSION)\"/" pyproject.toml && rm -f pyproject.toml.bak; \
		fi
	@echo "✅ Version updated to $(VERSION)"

version-bump-all: version-bump-npm version-bump-pip
	@echo "✅ All versions updated to $(VERSION)"

