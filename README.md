# Kaleidoswap SDK

Official multi-language SDK for interacting with [Kaleidoswap](https://kaleidoswap.com), a decentralized exchange for Bitcoin and RGB assets on the Lightning Network.

## SDKs

| Language | Status | Package | README |
|----------|--------|---------|--------|
| **Python** | ✅ Ready | `kaleidoswap-sdk` v0.5.4 | [python-sdk/README.md](./python-sdk/README.md) |
| **TypeScript** | ✅ Ready | `kaleidoswap-sdk` v0.5.4 | [typescript-sdk/README.md](./typescript-sdk/README.md) |

## How It Works

```text
specs/kaleidoswap.json
specs/rgb-lightning-node.yaml
          |
          +--> scripts/generate_python_sdk_models.sh --> python-sdk/kaleidoswap_sdk/_generated/
          |
          +--> scripts/generate_typescript_types.sh  --> typescript-sdk/src/generated/
```

Each SDK is implemented natively in its language and consumes generated types/models from the same OpenAPI source of truth.

## Features

- Typed models generated from OpenAPI specs
- Market operations: assets, pairs, quotes
- Swap operations and order lifecycle
- LSP (Lightning Service Provider) channel ordering
- RGB Lightning Node control (wallet, channels, assets, payments)
- WebSocket real-time quote streaming with auto-reconnect
- Precision and unit conversion utilities
- Typed error hierarchy with retryability hints

## Installation

### Python

```bash
pip install kaleidoswap-sdk
```

### TypeScript / Node.js

```bash
pnpm add kaleidoswap-sdk
# or: npm install kaleidoswap-sdk
```

## Quick Start

### Python

```python
import asyncio
from kaleidoswap_sdk import KaleidoClient

async def main() -> None:
    client = KaleidoClient.create(base_url="https://api.kaleidoswap.com")

    async with client:
        assets = await client.maker.list_assets()
        print(f"Found {len(assets.assets)} assets")

        pairs = await client.maker.list_pairs()
        print(f"Found {len(pairs.pairs)} pairs")

asyncio.run(main())
```

See [python-sdk/README.md](./python-sdk/README.md) for the full usage guide.

### TypeScript

```typescript
import { KaleidoClient } from 'kaleidoswap-sdk';

const client = KaleidoClient.create({
  baseUrl: 'https://api.kaleidoswap.com',
});

const assets = await client.maker.listAssets();
console.log(`Found ${assets.assets.length} assets`);

const pairs = await client.maker.listPairs();
console.log(`Found ${pairs.pairs.length} pairs`);
```

See [typescript-sdk/README.md](./typescript-sdk/README.md) for the full usage guide.

## API Coverage

| API | Description | Status |
|-----|-------------|--------|
| Market | Assets, pairs, quotes | ✅ |
| Swaps | Atomic swap operations | ✅ |
| Swap Orders | Order creation, status, history | ✅ |
| LSPS1 | Lightning channel service | ✅ |
| RGB Node | Node, wallet, channels, payments | ✅ |

## Development

### Prerequisites

- Python 3.10+
- Node.js 18+
- pnpm
- uv

### Build

```bash
# Build both SDKs
make build

# Build individually
make build-python-sdk
make build-typescript
```

### Test

```bash
# Run all tests
make test

# Run per SDK
make test-python-sdk
make test-typescript
```

### Regenerate Models

```bash
# Regenerate both SDK model/type outputs
make generate-models

# Regenerate individually
make generate-python-sdk-models
make generate-ts-types

# Full refresh (download latest specs + regenerate)
make regenerate
```

## Roadmap

- [x] Python SDK
- [x] TypeScript SDK
- [x] OpenAPI-driven model generation
- [x] WebSocket support
- [ ] Swift SDK for iOS/macOS
- [ ] Kotlin SDK for Android
- [ ] CLI tool

## Contributing

We welcome contributions. See [CONTRIBUTING.md](./CONTRIBUTING.md).

Key points:
- Never edit generated model files directly — regenerate from OpenAPI specs.
- Include tests for behavior changes.
- Run format/lint checks before pushing.

## License

MIT License. See [LICENSE](./LICENSE).

## Resources

- Specs: [specs/kaleidoswap.json](./specs/kaleidoswap.json), [specs/rgb-lightning-node.yaml](./specs/rgb-lightning-node.yaml)
- RGB Lightning Node: [RGB-Tools/rgb-lightning-node](https://github.com/RGB-Tools/rgb-lightning-node)
- Website: [kaleidoswap.com](https://kaleidoswap.com)
