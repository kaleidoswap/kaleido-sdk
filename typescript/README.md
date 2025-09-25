# KaleidoSwap TypeScript SDK

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

## Features

- Full TypeScript support with type definitions
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
import { SwapSettlement } from 'kaleidoswap-sdk';

// Create a swap order from an RFQ
const createOrderRequest = {
  rfq_id: 'rfq-id-from-quote',
  from_type: SwapSettlement.ONCHAIN,
  to_type: SwapSettlement.LIGHTNING,
  min_onchain_conf: 1,
  dest_bolt11: 'lnbc100n1...', // Lightning invoice for payout
  refund_address: 'bc1q...' // Bitcoin address for refunds
};

const order = await client.createOrder(createOrderRequest);
console.log('Order created:', order);

// Get order status
const statusRequest = {
  order_id: order.id
};

const orderStatus = await client.getOrderStatus(statusRequest);
console.log('Order status:', orderStatus);
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