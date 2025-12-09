# Rust SDK Proof of Concept

This directory contains the Proof of Concept implementation of a unified Rust SDK with Python and TypeScript bindings.

## Structure

```
rust-poc/
├── kaleidoswap-core/      # Core Rust library
├── kaleidoswap-python/    # PyO3 Python bindings  
├── kaleidoswap-node/      # NAPI-RS TypeScript bindings
└── examples/              # Usage examples
```

## Features Implemented

✅ **Core Rust Library** (`kaleidoswap-core`)
- Client configuration and initialization
- HTTP client with error handling
- Type-safe API methods:
  - `list_assets()` - List all available assets
  - `list_pairs()` - List all trading pairs
  - `get_quote()` - Get quote (low-level API)
  - `get_quote_by_pair()` - Get quote by ticker (high-level convenience API)
  - `get_asset_by_ticker()` - Find asset by ticker symbol
  - `get_pair_by_ticker()` - Find pair by ticker
- Internal caching for assets and pairs
- Comprehensive error types

✅ **Python Bindings** (`kaleidoswap-python`)
- Full PyO3 integration with async/await support
- All core methods exposed to Python
- Python type hints (`.pyi` stubs) for IDE support
- Idiomatic Python API

✅ **TypeScript Bindings** (`kaleidoswap-node`)
- Full NAPI-RS integration with async/await support
- All core methods exposed to TypeScript/Node.js
- Auto-generated TypeScript type definitions
- JSDoc comments for documentation

## Building & Testing

### Quick Start

We provide scripts to make building and testing easy:

**Using the build script (recommended):**
```bash
chmod +x build.sh test.sh
./build.sh all        # Build everything
./test.sh            # Run all tests
./build.sh examples  # Run examples
```

**Using Make:**
```bash
make help     # Show all available commands
make all      # Build and test everything
make quick    # Quick build (core + Python)
make examples # Run all examples
```

See **[QUICKSTART.md](file:///Users/walter/Lavoro/Kaleidoswap/kaleido-sdk/rust-poc/QUICKSTART.md)** for detailed instructions.

### Manual Build

### Core Rust Library

```bash
cd kaleidoswap-core
cargo test
cargo build --release
```

### Python Bindings

```bash
cd kaleidoswap-python

# Install maturin if you haven't already
pip install maturin

# Build and install in development mode
maturin develop

# Or build wheel
maturin build --release
```

### TypeScript Bindings

```bash
cd kaleidoswap-node

# Install NAPI-RS CLI if you haven't already
npm install -g @napi-rs/cli

# Build native module
napi build --release

# Test
npm test
```

## Usage Examples

### Python

```python
import asyncio
from kaleidoswap_sdk import KaleidoClient

async def main():
    client = KaleidoClient()
    
    # Simple quote - NO BOILERPLATE!
    quote = await client.get_quote_by_pair("BTC/USDT", from_amount=10000.0)
    print(f"Rate: {quote.rate}")

asyncio.run(main())
```

### TypeScript

```typescript
import { KaleidoClient } from '@kaleidoswap/sdk-poc';

async function main() {
  const client = new KaleidoClient();
  
  // Simple quote - NO BOILERPLATE!
  const quote = await client.getQuoteByPair('BTC/USDT', 10000.0, null);
  console.log(`Rate: ${quote.rate}`);
}

main();
```

## Comparison: Before vs After

### Before (Current TypeScript SDK - 10+ lines of boilerplate)

```typescript
const client = new KaleidoClient({ baseUrl: API_URL });
const pairs = await client.pairList();
const assetMapper = createAssetPairMapper(pairs);
const precisionHandler = createPrecisionHandler(assetMapper.getAllAssets());
const btc = assetMapper.findByTicker('BTC');
const usdt = assetMapper.findByTicker('USDT');
const validation = precisionHandler.validateOrderSize(10000, usdt);
const quote = await client.quoteRequest(btc.asset_id, usdt.asset_id, validation.asset_amount);
```

### After (New Rust SDK - 2 lines!)

```typescript
const client = new KaleidoClient();
const quote = await client.getQuoteByPair('BTC/USDT', 10000.0);
```

## Next Steps

1. **Performance Benchmarking**: Compare latency and memory usage vs current SDKs
2. **Additional Methods**: Implement swap operations, WebSocket support
3. **CI/CD**: Set up multi-platform builds
4. **Documentation**: Generate API docs
5. **Decision Point**: Go/no-go for full migration based on PoC results

## Benefits Demonstrated

✅ **Single Codebase**: Write once in Rust, use in Python and TypeScript
✅ **Type Safety**: Rust's type system ensures correctness across all languages
✅ **Better DX**: Simplified API with convenience methods
✅ **Performance**: Native code with zero-copy where possible
✅ **Maintainability**: One implementation, one test suite

## License

MIT
