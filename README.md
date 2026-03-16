# Kaleidoswap SDK

Official multi-language SDK for interacting with [Kaleidoswap](https://kaleidoswap.com), a decentralized exchange for Bitcoin and RGB assets on the Lightning Network.

## SDKs

| Language | Status | Package | README |
|----------|--------|---------|--------|
| **Python** | ✅ Ready | `kaleido-sdk` v0.1.0 | [python-sdk/README.md](./python-sdk/README.md) |
| **TypeScript** | ✅ Ready | `kaleido-sdk` v0.1.0 | [typescript-sdk/README.md](./typescript-sdk/README.md) |

## Installation

### Python

```bash
pip install kaleido-sdk
```

### TypeScript / Node.js

```bash
npm install kaleido-sdk
# or: pnpm add kaleido-sdk
```

## How It Works

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

## License

MIT License. See [LICENSE](./LICENSE).

## Resources

- Specs: [specs/kaleidoswap.json](./specs/kaleidoswap.json), [specs/rgb-lightning-node.yaml](./specs/rgb-lightning-node.yaml)
- RGB Lightning Node: [RGB-Tools/rgb-lightning-node](https://github.com/RGB-Tools/rgb-lightning-node)
- Website: [kaleidoswap.com](https://kaleidoswap.com)
- Docs: [docs.kaleidoswap.com](https://docs.kaleidoswap.com)
