#!/bin/bash
set -e
echo "Running Python SDK Tests..."
cd python-sdk
uv run pytest tests/ || echo "Python SDK tests failed"
cd ../typescript-sdk
echo "Running TypeScript SDK Tests..."
pnpm test || echo "TypeScript SDK tests failed"
