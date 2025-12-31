#!/bin/bash
set -e
echo "Running Python Tests..."
cd bindings/python
./.venv/bin/pytest tests/test_btc_ln_to_rgb_swap.py || echo "Python tests failed"
cd ../typescript
echo "Running TypeScript Tests..."
npm test tests/swap-btc-ln-to-rgb.test.ts || echo "TypeScript tests failed"
