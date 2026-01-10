# Kaleidoswap SDK - TypeScript/JavaScript

[![npm version](https://badge.fury.io/js/kaleidoswap-sdk.svg)](https://www.npmjs.com/package/kaleidoswap-sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/tests-80%2F81%20passing-green.svg)](./tests)

Pure TypeScript SDK for interacting with the Kaleidoswap protocol. Trade RGB assets on Lightning Network with full type safety.

## Features

- ✅ **Full Type Safety** - Auto-generated types from OpenAPI specs
- ✅ **WebSocket Support** - Real-time quote streaming
- ✅ **Auto-reconnection** - Resilient WebSocket connections
- ✅ **Zero Dependencies** - Just `openapi-fetch` and `ws`
- ✅ **Tree-shakeable** - Import only what you need
- ✅ **ESM & CommonJS** - Works everywhere

## Installation

```bash
npm install kaleidoswap-sdk
# or
pnpm add kaleidoswap-sdk
# or
yarn add kaleidoswap-sdk
```

## Quick Start

```typescript
import { KaleidoClient } from 'kaleidoswap-sdk';

// Create client
const client = KaleidoClient.create({
  baseUrl: 'https://api.kaleidoswap.com'
});

// List available assets
const assets = await client.maker.listAssets();

// Get a quote
const quote = await client.maker.getQuote({
  from_asset: { asset_id: 'btc', layer: 'BTC_LN', amount: '0.1' },
  to_asset: { asset_id: 'usdt', layer: 'RGB_LN' }
});

// Create swap order
const order = await client.maker.createSwapOrder({
  rfq_id: quote.rfq_id
});
```

## WebSocket - Real-time Quotes

```typescript
// Enable WebSocket
const clientId = crypto.randomUUID();
client.maker.enableWebSocket(`wss://api.kaleidoswap.com/ws/${clientId}`);

// Stream quotes
const unsubscribe = await client.maker.streamQuotes(
  'btc',        // from asset
  'usdt',       // to asset
  10000000,     // 0.1 BTC in satoshis
  'BTC_LN',     // from layer
  'RGB_LN',     // to layer
  (quote) => {
    console.log('Price:', quote.price);
    console.log('Amount:', quote.to_amount);
    console.log('Expires:', new Date(quote.expires_at));
  }
);

// Stop streaming
unsubscribe();
```

## API Reference

### Maker API (Market Operations)

```typescript
// List assets
const assets = await client.maker.listAssets();

// List trading pairs
const pairs = await client.maker.listPairs();

// Get quote
const quote = await client.maker.getQuote({ ...params });

// Create swap order
const order = await client.maker.createSwapOrder({ rfq_id });

// Get order status
const status = await client.maker.getSwapOrderStatus(orderId);

// Wait for swap completion
await client.maker.waitForSwapCompletion(orderId, {
  timeout: 60000,
  pollInterval: 2000
});
```

### Node API (RGB/Lightning Operations)

```typescript
// Get node info
const info = await client.rln.getNodeInfo();

// List channels
const channels = await client.rln.listChannels();

// Create invoice
const invoice = await client.rln.createInvoice({
  amount: 10000,
  description: 'Payment'
});

// Send payment
const payment = await client.rln.sendPayment({
  invoice: 'lnbc...'
});
```

### WebSocket Events

```typescript
const ws = client.maker.enableWebSocket(wsUrl);

ws.on('connected', () => console.log('Connected'));
ws.on('disconnected', () => console.log('Disconnected'));
ws.on('reconnecting', (attempt) => console.log(`Reconnect ${attempt}`));
ws.on('quoteResponse', (quote) => console.log('Quote:', quote));
ws.on('error', (error) => console.error('Error:', error));
```

## Precision Handling

```typescript
import { toRawAmount, toDisplayAmount } from 'kaleidoswap-sdk';

// Convert display amount to raw (satoshis for BTC)
const sats = toRawAmount('0.1', 8); // 10000000

// Convert raw amount to display
const btc = toDisplayAmount(10000000n, 8); // '0.10000000'
```

## Error Handling

```typescript
import { 
  KaleidoError, 
  APIError, 
  ValidationError,
  QuoteExpiredError 
} from 'kaleidoswap-sdk';

try {
  const order = await client.maker.createSwapOrder({ rfq_id });
} catch (error) {
  if (error instanceof QuoteExpiredError) {
    console.log('Quote expired - get new quote');
  } else if (error instanceof ValidationError) {
    console.log('Invalid params:', error.message);
  } else if (error instanceof APIError && error.isRetryable()) {
    // Retry logic
  }
}
```

## TypeScript

Full TypeScript support with auto-generated types from OpenAPI specs:

```typescript
import type {
  Asset,
  TradingPair,
  Quote,
  QuoteResponse,
  CreateSwapOrderRequest,
  Layer,
  QuoteResponse  // WebSocket types
} from 'kaleidoswap-sdk';
```

## Examples

See the [walkthrough documentation](./docs/walkthrough.md) for complete examples including:
- Real-time trading widget
- Swap order lifecycle
- WebSocket connection management
- Error handling patterns

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm run build

# Tests
pnpm test

# Type check
pnpm run typecheck
```

## License

MIT

## Links

- [Documentation](./docs/)
- [API Reference](https://api.kaleidoswap.com/docs)
- [GitHub](https://github.com/kaleidoswap/kaleido-sdk)
- [npm](https://www.npmjs.com/package/kaleidoswap-sdk)
