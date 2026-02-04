# Kaleidoswap TypeScript SDK Documentation

Welcome to the Kaleidoswap TypeScript SDK documentation. This SDK provides a type-safe interface for trading RGB assets on Bitcoin Lightning Network.

## Table of Contents

1. [Getting Started](./getting-started.md) - Installation and basic setup
2. [API Reference](./api-reference.md) - Types and interfaces reference
3. [Utilities](./utilities.md) - Helper functions and classes
4. [Examples](./examples.md) - Code examples for common tasks
5. [Error Handling](./error-handling.md) - Working with errors

## Quick Links

- [GitHub Repository](https://github.com/kaleidoswap/kaleido-sdk)
- [API Documentation](https://api.kaleidoswap.com/docs)
- [npm Package](https://www.npmjs.com/package/kaleidoswap-sdk)

## Features

- ✅ **Full Type Safety** - Auto-generated types from OpenAPI specs
- ✅ **WebSocket Support** - Real-time quote streaming
- ✅ **Auto-reconnection** - Resilient WebSocket connections
- ✅ **Utility Helpers** - AssetPairMapper and PrecisionHandler
- ✅ **Error Classes** - Typed error handling
- ✅ **Tree-shakeable** - Import only what you need

## Installation

```bash
npm install kaleidoswap-sdk
# or
pnpm add kaleidoswap-sdk
# or
yarn add kaleidoswap-sdk
```

## Basic Example

```typescript
import { 
  KaleidoClient, 
  createAssetPairMapper, 
  createPrecisionHandler 
} from 'kaleidoswap-sdk';

// Create client
const client = KaleidoClient.create({
  baseUrl: 'https://api.kaleidoswap.com'
});

// Fetch trading pairs and create helpers
const pairs = await client.maker.listPairs();
const mapper = createAssetPairMapper(pairs);
const precision = createPrecisionHandler(mapper.getAllAssets());

// Find assets
const btc = mapper.findByTicker('BTC');
const usdt = mapper.findByTicker('USDT');

// Get a quote
const quote = await client.maker.getQuote({
  from_asset: { asset_id: btc.asset_id, layer: 'BTC_LN', amount: 10000000 },
  to_asset: { asset_id: usdt.asset_id, layer: 'RGB_LN' }
});

console.log(`Quote: ${quote.from_asset.amount} ${quote.from_asset.ticker} → ${quote.to_asset.amount} ${quote.to_asset.ticker}`);
```
