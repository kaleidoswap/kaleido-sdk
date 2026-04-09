# Kaleidoswap SDK

[![npm](https://img.shields.io/npm/v/kaleido-sdk)](https://www.npmjs.com/package/kaleido-sdk)
[![PyPI](https://img.shields.io/pypi/v/kaleido-sdk)](https://pypi.org/project/kaleido-sdk/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

Official multi-language SDK for [Kaleidoswap](https://kaleidoswap.com) — a decentralized exchange for Bitcoin and RGB assets on the Lightning Network.

> **Beta Software — Use at Your Own Risk**
>
> This SDK is under active development and currently intended for **testnet/signet use only**. It is **not considered safe for mainnet** or production environments. APIs may change without notice. The authors assume no responsibility for any loss of funds or damages arising from the use of this software. Use it at your own risk.

## Overview

The SDK provides two sub-clients for interacting with the Kaleidoswap protocol:

| Sub-client | What it does |
|---|---|
| `client.maker` | Kaleidoswap market API — assets, pairs, quotes, swap orders, LSP |
| `client.rln` | RGB Lightning Node — wallet, channels, payments, RGB asset operations |

## SDKs

| Language | Package | Status | Docs |
|----------|---------|--------|------|
| **TypeScript** | [`kaleido-sdk`](https://www.npmjs.com/package/kaleido-sdk) | [![npm](https://img.shields.io/npm/v/kaleido-sdk)](https://www.npmjs.com/package/kaleido-sdk) | [README](./typescript-sdk/README.md) |
| **Python** | [`kaleido-sdk`](https://pypi.org/project/kaleido-sdk/) | [![PyPI](https://img.shields.io/pypi/v/kaleido-sdk)](https://pypi.org/project/kaleido-sdk/) | [README](./python-sdk/README.md) |


## Quick Start

### TypeScript

```bash
npm install kaleido-sdk
```

```typescript
import { KaleidoClient } from 'kaleido-sdk';

const client = KaleidoClient.create({
  baseUrl: 'https://api.signet.kaleidoswap.com',
});

const assets = await client.maker.listAssets();
const pairs  = await client.maker.listPairs();
```

### Python

```bash
pip install kaleido-sdk
```

```python
from kaleido_sdk import KaleidoClient

client = KaleidoClient.create(base_url="https://api.signet.kaleidoswap.com")

assets = await client.maker.list_assets()
pairs  = await client.maker.list_pairs()
```

### RLN (RGB Lightning Node) access

```typescript
import { RlnClient } from 'kaleido-sdk/rln';

// Standalone
const rln = new RlnClient({ nodeUrl: 'http://localhost:3001' });
const info = await rln.getNodeInfo();

// Or via KaleidoClient
const client = KaleidoClient.create({
  baseUrl: 'https://api.signet.kaleidoswap.com',
  nodeUrl: 'http://localhost:3001',
});
const channels = await client.rln.listChannels();
```

## Architecture

```text
specs/kaleidoswap.json
specs/rgb-lightning-node.yaml
          |
          +--> scripts/generate_python_sdk_models.sh --> python-sdk/kaleido_sdk/_generated/
          |
          +--> scripts/generate_typescript_types.sh  --> typescript-sdk/src/generated/
```

Each SDK is implemented natively in its language and consumes generated types/models from the same OpenAPI source of truth. Never edit the generated files directly — regenerate them from the specs instead.

## Development

### Prerequisites

- Python 3.10+
- Node.js 18+
- pnpm
- uv

### Build

```bash
make build               # Build all SDKs
make build-typescript     # TypeScript only
make build-python-sdk     # Python only
```

### Test

```bash
make test                 # Run all tests
make test-typescript      # TypeScript only
make test-python-sdk      # Python only
```

### Code Quality

```bash
make check                # Format, lint, and typecheck all SDKs
make fix                  # Auto-fix format and lint issues
make pre-commit           # Same checks as CI
```

### Regenerate Types

```bash
make generate-models      # Regenerate all models from specs
make regenerate           # Download latest specs + regenerate
```

### Version Sync

```bash
make versions                       # Show current SDK versions
make sync-version VERSION=0.2.0     # Sync version across all SDKs
```

## Roadmap

- [x] Python SDK
- [x] TypeScript SDK
- [x] OpenAPI-driven model generation
- [x] WebSocket support
- [ ] Rust SDK (`kaleidoswap-core` — WIP)
- [ ] Swift SDK for iOS/macOS
- [ ] Kotlin SDK for Android

## License

MIT License. See [LICENSE](./LICENSE).

## Resources

- Documentation: [docs.kaleidoswap.com](https://docs.kaleidoswap.com/sdk/introduction)
- Specs: [kaleidoswap.json](./specs/kaleidoswap.json), [rgb-lightning-node.yaml](./specs/rgb-lightning-node.yaml)
- RGB Lightning Node: [RGB-Tools/rgb-lightning-node](https://github.com/RGB-Tools/rgb-lightning-node)
- Website: [kaleidoswap.com](https://kaleidoswap.com)
