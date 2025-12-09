#!/usr/bin/env bash
#
# Simple runner script that activates venv and runs Python example
#

set -e

cd "$(dirname "$0")/.."

# Activate the venv if it exists
if [ -f "kaleidoswap-python/.venv/bin/activate" ]; then
    source kaleidoswap-python/.venv/bin/activate
    python3 examples/python_example.py
else
    echo "❌ Virtual environment not found!"
    echo "Run './build.sh install-py' first to install Python bindings"
    exit 1
fi
