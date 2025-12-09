# Makefile for Rust SDK PoC
#
# Provides convenient commands for building and testing all components

.PHONY: help check build test clean install-python examples all
.PHONY: build-core test-core build-python build-typescript
.PHONY: run-python run-typescript

# Default target
.DEFAULT_GOAL := help

# Colors
BLUE := \033[0;34m
GREEN := \033[0;32m
NC := \033[0m

##@ General

help: ## Display this help message
	@echo "$(BLUE)Rust SDK PoC - Build Commands$(NC)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf "Usage:\n  make $(GREEN)<target>$(NC)\n"} \
		/^[a-zA-Z_0-9-]+:.*?##/ { printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2 } \
		/^##@/ { printf "\n%s\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

check: ## Check all dependencies
	@./build.sh check

all: check build test install-python ## Build and test everything
	@echo "$(GREEN)✓ All components built and tested$(NC)"

##@ Building

build: build-core build-python build-typescript ## Build all components

build-core: ## Build core Rust library
	@./build.sh build-core

build-python: ## Build Python bindings
	@./build.sh build-python

build-typescript: ## Build TypeScript bindings
	@./build.sh build-ts

##@ Testing

test: test-core ## Run all tests

test-core: ## Test core Rust library
	@./build.sh test-core

##@ Installation

install-python: ## Install Python bindings in development mode
	@./build.sh install-py

##@ Examples

examples: run-python run-typescript ## Run all examples

run-python: ## Run Python example
	@./build.sh run-py

run-typescript: ## Run TypeScript example
	@./build.sh run-ts

##@ Cleanup

clean: ## Clean build artifacts
	@./build.sh clean

##@ Development

watch-core: ## Watch and rebuild core library on changes
	@cd kaleidoswap-core && cargo watch -x check -x test

fmt: ## Format all Rust code
	@cargo fmt --all

lint: ## Lint all Rust code
	@cargo clippy --all-targets --all-features -- -D warnings

##@ Quick Commands

quick: build-core install-python ## Quick build (core + Python dev install)
	@echo "$(GREEN)✓ Quick build complete. Try: make run-python$(NC)"
