# ⚠️ DEPRECATED: KaleidoSwap TypeScript SDK

> **This SDK is deprecated.** Please use the new UniFFI-based SDK in [`bindings/typescript/`](../bindings/typescript/) instead.
>
> The legacy code below is kept for reference but will not receive updates.

---

# KaleidoSwap TypeScript SDK (Legacy)

A TypeScript SDK for interacting with the KaleidoSwap protocol, providing a simple and type-safe interface for trading assets.

## Installation

```bash
npm install kaleidoswap-sdk
```

## Quick Start

```typescript
import { KaleidoClient, KaleidoConfig } from 'kaleidoswap-sdk';

// Initialize the client
const config: KaleidoConfig = {
  baseUrl: 'https://api.kaleidoswap.com',
  nodeUrl: 'https://node.kaleidoswap.com',
  apiKey: 'your-api-key'
};

const client = new KaleidoClient(config);

// Get node information
const nodeInfo = await client.getNodeInfo();
console.log('Node pubkey:', nodeInfo.pubkey);

// List available assets
const assets = await client.listAssets();
console.log('Available assets:', assets);

// Get a quote for swapping assets
const quote = await client.getQuote('BTC/USDT', 1.5, true);
console.log('Quote:', quote);
```

## Enhanced SDK Methods (New!)

The TypeScript SDK now includes enhanced utility methods that make it much easier to work with assets and execute swaps:

```typescript
import { KaleidoClient } from 'kaleidoswap-sdk';

const client = new KaleidoClient({
  baseUrl: 'https://api.kaleidoswap.com',
  nodeUrl: 'https://node.kaleidoswap.com' // Required for swap execution
});

// 1. Easy asset lookup by ticker
const btc = await client.getAssetByTicker('BTC');
const usdt = await client.getAssetByTicker('USDT');

// 2. Trading pair validation
const pair = await client.getPairByTicker('BTC', 'USDT');
console.log(`Can trade: ${pair?.canTrade}`);

// 3. Enhanced quotes with decimal amounts (no manual conversion!)
const quote = await client.getQuoteByAssets('BTC', 'USDT', 0.001); // 0.001 BTC
console.log(`${quote.fromDecimalAmount} BTC → ${quote.toDecimalAmount} USDT`);

// 4. One-call swap execution (like Python SDK)
const result = await client.executeSwap('BTC', 'USDT', 0.001);
console.log(`Swap completed: ${result.status}`);
```

### Key Benefits:
- **No manual unit conversion** - work with decimal amounts directly
- **Automatic validation** - helpful error messages for invalid amounts/pairs
- **One-call execution** - complete swaps without managing individual steps
- **Type safety** - full TypeScript support with enhanced return types

## Features

- Full TypeScript support with type definitions
- **Enhanced utility methods for easier asset and pair management**
- **One-call swap execution (similar to Python SDK)**
- **Automatic decimal amount handling and validation**
- Automatic retry mechanism for failed requests
- WebSocket support for real-time updates
- Comprehensive error handling
- Rate limiting protection
- Authentication support

## API Reference

### KaleidoClient

The main client class for interacting with the KaleidoSwap API.

#### Constructor

```typescript
const client = new KaleidoClient(config: KaleidoConfig);
```

#### Configuration

```typescript
interface KaleidoConfig {
  baseUrl: string;      // API base URL
  nodeUrl: string;      // Node base URL
  apiKey?: string;      // Optional API key
  retryConfig?: {       // Optional retry configuration
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    exponentialBase?: number;
    jitter?: boolean;
  };
}
```

#### Methods

##### Node Operations

```typescript
// Get node information
const nodeInfo = await client.getNodeInfo();

// Get node public key
const pubkey = await client.getNodePubkey();
```

##### Asset Operations

```typescript
// List all assets
const assets = await client.listAssets();

// Get asset metadata
const asset = await client.getAssetMetadata('asset-id');
```

##### Trading Pair Operations

```typescript
// List all trading pairs
const pairs = await client.listPairs();

// Get pair by assets
const pair = await client.getPairByAssets('BTC', 'USDT');
```

##### Quote Operations

```typescript
// Get quote for a swap
const quote = await client.getQuote('pair-id', amount, isBase);
```

##### Swap Operations

```typescript
// Initialize a maker swap
const swap = await client.initMakerSwap('pair-id', amount, isBase);

// Execute a maker swap
const result = await client.executeMakerSwap('swap-id');

// Whitelist a trade
const whitelisted = await client.whitelistTrade('swapstring');

// Confirm a swap
const confirmed = await client.confirmSwap('swap-id');

// Get swap status
const status = await client.getSwapStatus('swap-id');
```

##### Order Operations

```typescript
// Create a swap order from an RFQ
const createOrderRequest = {
  rfq_id: 'rfq-id-from-quote',
  from_type: 'ONCHAIN',
  to_type: 'ONCHAIN',
  min_onchain_conf: 1,
  dest_rgb_invoice: 'rgb:2whK8s5O-...', // RGB invoice for payout
  refund_address: 'rgb:2whK8s5O-...'   // RGB address for refunds
};

const order = await client.createOrder(createOrderRequest);
console.log('Order ID:', order.id);
console.log('Payment Address:', order.onchain_address);
console.log('Status:', order.status);

// Get order status
const orderStatus = await client.swapOrderStatus(order.id);
console.log('Order status:', orderStatus.status);
// Possible statuses: 'PENDING_PAYMENT', 'COMPLETED', 'FAILED'
```

### WebSocket Client

For real-time updates and market data.

```typescript
import { WebSocketClient, WebSocketConfig } from 'kaleidoswap-sdk';

const wsConfig: WebSocketConfig = {
  baseUrl: 'wss://ws.kaleidoswap.com',
  apiKey: 'your-api-key',
  pingInterval: 30000,
  pingTimeout: 5000,
  reconnectInterval: 5000,
  maxReconnectAttempts: 5
};

const ws = new WebSocketClient(wsConfig);

// Connect to WebSocket
await ws.connect();

// Subscribe to pair updates
await ws.subscribe('BTC/USDT');

// Handle messages
ws.on('quote', (data) => {
  console.log('New quote:', data);
});

// Unsubscribe
await ws.unsubscribe('BTC/USDT');

// Disconnect
await ws.disconnect();
```

## Error Handling

The SDK provides a comprehensive error handling system with specific error types:

```typescript
import {
  KaleidoError,
  NetworkError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  SwapError,
  TimeoutError,
  WebSocketError,
  AssetError,
  PairError,
  QuoteError,
  NodeError
} from 'kaleidoswap-sdk';

try {
  await client.getQuote('BTC/USDT', 1.5);
} catch (error) {
  if (error instanceof RateLimitError) {
    console.log('Rate limit exceeded, please wait');
  } else if (error instanceof ValidationError) {
    console.log('Invalid request:', error.message);
  } else {
    console.log('Unexpected error:', error);
  }
}
```

## Retry Mechanism

The SDK includes an automatic retry mechanism for failed requests:

```typescript
import { retry, RetryConfig } from 'kaleidoswap-sdk';

const retryConfig: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  exponentialBase: 2,
  jitter: true,
  retryOnExceptions: [NetworkError, RateLimitError]
};

// Use with custom function
const result = await retry(
  () => client.getQuote('BTC/USDT', 1.5),
  retryConfig
);
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 