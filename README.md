# Kaleidoswap SDK

Official multi-language SDK for interacting with [Kaleidoswap](https://kaleidoswap.com), a decentralized exchange for Bitcoin and RGB assets on the Lightning Network.

## Current SDK Architecture

The monorepo currently ships two production SDKs that are generated from shared OpenAPI specs:

| Language | Status | Package |
|----------|--------|---------|
| **Python** | ✅ Ready | `kaleidoswap-sdk` |
| **TypeScript** | ✅ Ready | `kaleidoswap-sdk` |
| **Swift** | 🚧 Planned | - |
| **Kotlin** | 🚧 Planned | - |

### How It Works

```text
specs/kaleidoswap.json
specs/rgb-lightning-node.yaml
          |
          +--> scripts/generate_python_sdk_models.sh --> python-sdk/kaleidoswap_sdk/_generated/
          |
          +--> scripts/generate_typescript_types.sh  --> typescript-sdk/src/generated/
```

Each SDK is implemented natively in its language and consumes generated types/models from the same API source of truth.

## Features

- Typed models generated from OpenAPI specs
- Market operations (assets, pairs, quotes)
- Swap operations and order flows
- RGB Lightning Node support
- WebSocket streaming
- Retry and error handling utilities

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
    client = KaleidoClient.create(base_url="https://api.regtest.kaleidoswap.com")

    async with client:
        assets = await client.maker.list_assets()
        print(f"Found {len(assets.assets)} assets")

        pairs = await client.maker.list_pairs()
        print(f"Found {len(pairs.pairs)} pairs")

asyncio.run(main())
```

### TypeScript

```typescript
import { KaleidoClient } from 'kaleidoswap-sdk';

const client = KaleidoClient.create({
  baseUrl: 'https://api.regtest.kaleidoswap.com',
});

const assets = await client.maker.listAssets();
console.log(`Found ${assets.assets.length} assets`);

const pairs = await client.maker.listPairs();
console.log(`Found ${pairs.pairs.length} pairs`);
```

## Documentation

- [Architecture](./docs/ARCHITECTURE.md)
- [API Reference](./docs/API_REFERENCE.md)
- [Examples](./docs/EXAMPLES.md)
- [Error Handling](./docs/ERROR_HANDLING.md)
- [WebSocket](./docs/WEBSOCKET.md)
- [SDK Development](./docs/SDK_DEVELOPMENT.md)

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

# Regenerate one SDK
make generate-python-sdk-models
make generate-ts-types

# Full refresh (download latest specs + regenerate)
make regenerate
```

## API Coverage

| API | Description | Status |
|-----|-------------|--------|
| Market | Assets, pairs, quotes | ✅ |
| Swaps | Atomic swap operations | ✅ |
| Swap Orders | Order creation and status | ✅ |
| LSPS1 | Lightning channel service | ✅ |
| RGB Node | Node operations | ✅ |

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
- Never edit generated model files directly.
- Regenerate from OpenAPI specs when API changes.
- Include tests for behavior changes.
- Run format/lint checks before pushing.

## License

MIT License. See [LICENSE](./LICENSE).

## Resources

- Specs: [specs/kaleidoswap.json](./specs/kaleidoswap.json), [specs/rgb-lightning-node.yaml](./specs/rgb-lightning-node.yaml)
- RGB Lightning Node: [RGB-Tools/rgb-lightning-node](https://github.com/RGB-Tools/rgb-lightning-node)
- Website: [kaleidoswap.com](https://kaleidoswap.com)
