# Quick Start Guide

## Prerequisites

Install the following tools:

- **Rust**: https://rustup.rs/
- **Python 3.11+**: https://www.python.org/
- **uv** (Python package manager): https://github.com/astral-sh/uv
- **Node.js 16+**: https://nodejs.org/
- **maturin**: `uv tool install maturin` (or `pip install --user maturin`)
- **NAPI-RS CLI** (optional): `npm install -g @napi-rs/cli`

## Quick Start

### Option 1: Using the build script (recommended)

```bash
# Check dependencies
./build.sh check

# Build everything
./build.sh all

# Run examples
./build.sh run-py    # Python example
./build.sh run-ts    # TypeScript example
```

### Option 2: Using Make

```bash
# See all available commands
make help

# Build and test everything
make all

# Quick build (core + Python dev install)
make quick

# Run examples
make run-python
make run-typescript
```

## Step-by-Step Build

### 1. Build Core Rust Library

```bash
cd kaleidoswap-core
cargo build --release
cargo test
cd ..
```

### 2. Build and Install Python Bindings

```bash
cd kaleidoswap-python

# Install maturin if not already installed
uv tool install maturin
# Or with pip: pip install --user maturin

# Build and install in development mode
maturin develop

# Or build wheel
maturin build --release

cd ..
```

### 3. Build TypeScript Bindings

```bash
cd kaleidoswap-node

# If you have @napi-rs/cli installed globally
napi build --release

# Or use npx
npm install
npx napi build --release

cd ..
```

## Running Examples

### Python Example

```bash
python3 examples/python_example.py
```

Expected output:
```
Creating Kaleidoswap client...

1. Listing assets...
   Found X assets
   - BTC: Bitcoin
   - USDT: Tether USD
   ...

2. Listing trading pairs...
   ...

3. Getting quote for BTC/USDT...
   Quote ID: ...
   Rate: ...

✅ All examples completed!
```

### TypeScript Example

```bash
# Install ts-node if not already installed
npm install -g ts-node typescript

# Run example
ts-node examples/typescript_example.ts
```

## Troubleshooting

### Python: "No module named 'kaleidoswap_sdk'"

Make sure you ran `maturin develop` in the `kaleidoswap-python` directory:

```bash
cd kaleidoswap-python
maturin develop
```

### TypeScript: "Cannot find module '@kaleidoswap/sdk-poc'"

The TypeScript example expects the module to be built. Build it first:

```bash
cd kaleidoswap-node
npm install
npx napi build --release
```

### Rust: Compilation errors

Make sure you're using a recent Rust version:

```bash
rustup update
```

### Build script not executable

```bash
chmod +x build.sh
```

## Next Steps

Once everything builds successfully:

1. **Run benchmarks** to compare performance with current SDK
2. **Add more methods** (swap operations, WebSocket support)
3. **Write tests** for Python and TypeScript bindings
4. **Create CI/CD pipeline** for multi-platform builds

## Useful Commands

```bash
# Build everything
make all

# Quick iteration (build core + install Python)
make quick

# Format code
make fmt

# Lint code
make lint

# Clean build artifacts
make clean

# Watch core library for changes
make watch-core
```
