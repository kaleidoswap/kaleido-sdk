# Kaleidoswap SDK

The official TypeScript SDK for interacting with the Kaleidoswap protocol - a decentralized exchange for Bitcoin and RGB assets.

## Features

- 📊 **Asset Management** - Utilities for managing trading pairs and assets
- 🔄 **Swap Operations** - Support for onchain and Lightning Network swaps
- 🔒 **Type Safe** - Full TypeScript support with comprehensive type definitions
- 🛡️ **Error Handling** - Comprehensive error types and handling
- 🌐 **Real-time Data** - WebSocket support for live quotes and updates
- 🔧 **Built-in Utilities** - Precision handling, retry mechanisms, and more

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

## Documentation

For detailed documentation, see:

- **[Getting Started](./typescript/docs/getting-started.md)** - Installation and configuration
- **[API Documentation](./typescript/docs/index.md)** - Complete SDK reference
- **[Examples](./typescript/docs/examples.md)** - Code examples and workflows
- **[Types](./typescript/docs/types.md)** - TypeScript type definitions
- **[Utilities](./typescript/docs/utilities.md)** - Helper functions and classes

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

## Contributing

We welcome contributions! Please see our [contributing guidelines](CONTRIBUTING.md) for more information.

## Roadmap

See our [ROADMAP.md](ROADMAP.md) for planned features and development timeline.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 