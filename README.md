# Kaleidoswap SDK

Official multi-language SDK for interacting with Kaleidoswap - a decentralized exchange for Bitcoin and RGB assets.

## 🌐 Multi-Language Support

- **TypeScript/JavaScript** - Full async/await support with TypeScript types
- **Python** - Async-first with type hints (Python 3.11+)
- **Rust** - Work in progress

## ✨ Features

- 📊 **Asset Management** - Utilities for managing trading pairs and assets
- 🔄 **Swap Operations** - Support for onchain and Lightning Network swaps
- 🔒 **Type Safe** - Full TypeScript/Python typing from OpenAPI specs
- 🛡️ **Error Handling** - Comprehensive error types and automatic retries
- 🌐 **Real-time Data** - WebSocket support for live quotes and updates
- 🔧 **Built-in Utilities** - Precision handling, retry mechanisms, and more
- 🤖 **Auto-Generated** - Code generated from OpenAPI specs for API parity

## Installation

Install via npm:

```bash
npm install @kaleidoswap/kaleidoswap-sdk
```

Or with yarn:

```bash
yarn add @kaleidoswap/kaleidoswap-sdk
```

## Quick Start

```typescript
import { KaleidoClient } from '@kaleidoswap/kaleidoswap-sdk';

async function main() {
    // Initialize client
    const client = new KaleidoClient({
        baseUrl: 'https://api.staging.kaleidoswap.com/api/v1'
    });

    // Get available trading pairs
    const pairs = await client.pairList();
    console.log('Available pairs:', pairs);

    // Get available assets
    const assets = await client.assetList();
    console.log('Available assets:', assets);

    // Get a quote
    const quote = await client.quoteRequest(
        'BTC',
        'rgb:q1O5Mn5y-7EoxdTy-xu3ChkP-HmhgGvJ-vQ3ryQ9-CcMxkfg', // USDT
        100000000 // 1 BTC in satoshis
    );
    console.log('Quote:', quote);
}

main().catch(console.error);
```

## 📚 Documentation

### General
- **[Code Generation Guide](./docs/CODE_GENERATION.md)** - How SDK code is auto-generated
- **[SDK Unification Proposal](./SDK_UNIFICATION_PROPOSAL.md)** - SDK architecture and design
- **[Roadmap](./ROADMAP.md)** - Planned features and development
- **[Contributing](./CONTRIBUTING.md)** - How to contribute

### TypeScript
- **[Getting Started](./typescript/docs/getting-started.md)** - Installation and configuration
- **[API Documentation](./typescript/docs/index.md)** - Complete SDK reference
- **[Examples](./typescript/docs/examples.md)** - Code examples and workflows
- **[Types](./typescript/docs/types.md)** - TypeScript type definitions
- **[Utilities](./typescript/docs/utilities.md)** - Helper functions and classes

### Python
- Coming soon

## Key Features

### Asset Management
Work with Bitcoin and RGB assets seamlessly:
```typescript
const pairs = await client.pairList();
const assets = await client.assetList();
```

### Swap Operations
Execute onchain and offchain swaps:
```typescript
const order = await client.createOrder({
    rfq_id: quote.rfq_id,
    from_type: 'ONCHAIN',
    to_type: 'ONCHAIN',
    // ... other parameters
});
```

### Utilities
Built-in helpers for precision handling and asset mapping:
```typescript
import { createAssetPairMapper, createPrecisionHandler } from '@kaleidoswap/kaleidoswap-sdk';

const assetMapper = createAssetPairMapper(pairs);
const precisionHandler = createPrecisionHandler(assetMapper.getAllAssets());
```

## 🔧 Development

### Code Generation

This SDK uses **auto-generation** from OpenAPI specs following industry best practices:

```bash
# Update OpenAPI specs from remote sources
make update-specs

# Generate SDK code (TypeScript + Python)
make generate

# Or generate individually
make generate-typescript
make generate-python
```

The SDK follows a **hybrid approach**:
- **Generated code**: Base clients, models, types (in `/generated` folders)
- **Hand-written code**: Convenience methods, utilities, error handling

See [Code Generation Guide](./docs/CODE_GENERATION.md) for details.

### Building

```bash
# Build both TypeScript and Python SDKs
make build

# Or build individually
make build-npm
make build-pip
```

### Testing

```bash
# Test both SDKs
make test

# Or test individually
make test-npm
make test-pip
```

### Linting and Formatting

```bash
# Format and lint all code
make format-lint

# Or individually
make format-npm lint-npm
make format-pip lint-pip
```

## 🤝 Contributing

We welcome contributions! Please see our [contributing guidelines](CONTRIBUTING.md) for more information.

**Important**: Never edit files in `/generated` directories directly. All customizations should go in hand-written wrapper code.

## 🗺️ Roadmap

See our [ROADMAP.md](ROADMAP.md) for planned features and development timeline.

## 📖 API Sources

This SDK is generated from official OpenAPI specifications:

- **Kaleidoswap API**: `https://api.staging.kaleidoswap.com/openapi.json`
- **RGB Lightning Node**: `https://github.com/RGB-Tools/rgb-lightning-node/blob/master/openapi.yaml`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 