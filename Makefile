.PHONY: help build test clean deploy-npm deploy-pip deploy-all version-bump-npm version-bump-pip version-bump-all

# Default target
help:
	@echo "Kaleidoswap SDK - Deployment Makefile"
	@echo ""
	@echo "Available targets:"
	@echo "  help              - Show this help message"
	@echo "  build             - Build both TypeScript and Python SDKs"
	@echo "  build-npm         - Build TypeScript SDK only"
	@echo "  build-pip         - Build Python SDK only"
	@echo "  test              - Run tests for both SDKs"
	@echo "  test-npm          - Run TypeScript SDK tests"
	@echo "  test-pip          - Run Python SDK tests"
	@echo "  clean             - Clean build artifacts for both SDKs"
	@echo "  clean-npm         - Clean TypeScript SDK build artifacts"
	@echo "  clean-pip         - Clean Python SDK build artifacts"
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
SCRIPTS_DIR := scripts

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

# Clean targets
clean: clean-npm clean-pip

clean-npm:
	@echo "🧹 Cleaning TypeScript SDK build artifacts..."
	cd $(TYPESCRIPT_DIR) && rm -rf dist node_modules/.cache

clean-pip:
	@echo "🧹 Cleaning Python SDK build artifacts..."
	cd $(PYTHON_DIR) && rm -rf dist build *.egg-info

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

