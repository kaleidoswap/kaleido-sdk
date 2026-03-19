# Kaleidoswap SDK — TypeScript / JavaScript

[![npm version](https://badge.fury.io/js/kaleidoswap-sdk.svg)](https://www.npmjs.com/package/kaleidoswap-sdk)

TypeScript SDK for trading RGB assets on the Lightning Network via the Kaleidoswap protocol.

## Installation

```bash
pnpm add kaleidoswap-sdk
# or: npm install kaleidoswap-sdk
```

Requires Node.js 18+. The package ships as ES modules with full TypeScript declarations.

## Quick Start

The SDK exposes two sub-clients that can be used **independently or together**:

| Sub-client | Config key | What it covers | Requires |
|---|---|---|---|
| `client.maker` | `baseUrl` | KaleidoSwap market API — assets, quotes, swap orders, atomic swaps, LSP | Public API URL |
| `client.rln` | `nodeUrl` | Your RGB Lightning Node — wallet, channels, payments, RGB assets | Running RLN daemon |

```typescript
import { KaleidoClient } from 'kaleidoswap-sdk';

// KaleidoSwap API only — no RLN node required
const client = KaleidoClient.create({
  baseUrl: 'https://api.signet.kaleidoswap.com',
});
const assets = await client.maker.listAssets();
const quote  = await client.maker.getQuote({ /* … */ });

// RLN node only — no KaleidoSwap API required
const client = KaleidoClient.create({
  nodeUrl: 'http://localhost:3001',
});
const info     = await client.rln.getNodeInfo();
const channels = await client.rln.listChannels();

// Both together — full swap flow
const client = KaleidoClient.create({
  baseUrl: 'https://api.signet.kaleidoswap.com',
  nodeUrl: 'http://localhost:3001',
});
const pairs    = await client.maker.listPairs();
const channels = await client.rln.listChannels();

// Zero-config — defaults to regtest, no node
const client = KaleidoClient.create();
const assets = await client.maker.listAssets();
```

## Configuration

All fields are optional. `KaleidoClient.create()` with no arguments connects to regtest.

```typescript
const client = KaleidoClient.create({
  baseUrl:    'https://api.signet.kaleidoswap.com', // Maker API URL (default: regtest)
  nodeUrl:    'http://localhost:3001',        // RGB Lightning Node URL
  apiKey:     'your-api-key',                // Optional API key
  timeout:    30,                            // Request timeout in seconds (default: 30)
  maxRetries: 3,                             // Auto-retry count (default: 3)
  logLevel:   'info',                        // 'debug' | 'info' | 'warn' | 'error' | 'silent'
  logger:     myLogger,                      // Custom logger (Winston, Pino, console, …)
});
```

### Environments

| Environment | `baseUrl` |
|-------------|-----------|
| Regtest (default) | `https://api.regtest.kaleidoswap.com` |
| Signet | `https://api.signet.kaleidoswap.com` |

## API Reference

### Market (`client.maker`)

```typescript
// List available assets
const { assets } = await client.maker.listAssets();

// List trading pairs with routes
const { pairs } = await client.maker.listPairs();

// Request a price quote (returns rfq_id valid for a short window)
const quote = await client.maker.getQuote({
  from_asset: { asset_id: 'BTC', layer: 'BTC_LN', amount: 10_000_000 },
  to_asset:   { asset_id: 'rgb:2JEUOrsc-...', layer: 'RGB_LN' },
});
// quote.rfq_id  — use within quote.expires_at to create a swap order
// quote.price   — exchange rate
```

### Swap Orders (`client.maker`)

```typescript
// Create a swap order from a valid quote
const order = await client.maker.createSwapOrder({
  rfq_id:           quote.rfq_id,
  from_asset:       { ...quote.from_asset, name: 'Bitcoin', precision: 11 },
  to_asset:         { ...quote.to_asset,   name: 'Tether USD', precision: 6 },
  receiver_address: { address: 'lnbc...', format: 'BOLT11' },
  min_onchain_conf: 1,
});

// Poll order status
const { order: status } = await client.maker.getSwapOrderStatus({
  order_id:     order.id,
  access_token: order.access_token,
});

// Wait for a terminal state (FILLED | FAILED | EXPIRED | CANCELLED)
const finalOrder = await client.maker.waitForSwapCompletion(order.id, {
  accessToken:    order.access_token,
  timeout:        300_000,   // ms (default: 5 min)
  pollInterval:   2_000,     // ms (default: 2 s)
  onStatusUpdate: (s) => console.log('Status:', s),
});

// Order history and analytics
const history   = await client.maker.getOrderHistory({ status: 'FILLED', limit: 20 });
const analytics = await client.maker.getOrderAnalytics();
```

### Atomic Swaps (`client.maker`)

```typescript
// Trustless atomic swap flow
const swap    = await client.maker.initSwap({ rfq_id: quote.rfq_id, /* … */ });
const confirm = await client.maker.executeSwap({ payment_hash: swap.payment_hash, /* … */ });
const status  = await client.maker.getAtomicSwapStatus({ payment_hash: swap.payment_hash });
const nodeInfo = await client.maker.getSwapNodeInfo();
```

### LSP — Lightning Service Provider (`client.maker`)

```typescript
const info    = await client.maker.getLspInfo();
const network = await client.maker.getLspNetworkInfo();

// Estimate fees before ordering a channel
const estimate = await client.maker.estimateLspFees({
  lsp_balance_sat:    1_000_000,
  client_balance_sat: 0,
  channel_expiry_blocks: 4320,
});

// Place a channel order
const channelOrder = await client.maker.createLspOrder({ /* … */ });
const orderStatus  = await client.maker.getLspOrder({ order_id: channelOrder.order_id });
```

### RGB Lightning Node (`client.rln`)

Requires `nodeUrl` in the config. Exposes full RGB Lightning Node control.

```typescript
const info     = await client.rln.getNodeInfo();
const address  = await client.rln.getAddress();
const balance  = await client.rln.getBalance();
const channels = await client.rln.listChannels();
const assets   = await client.rln.listAssets();
```

## WebSocket — Real-time Quote Streaming

WebSocket streaming requires an additional `enableWebSocket()` call. The server delivers one quote per request, so the SDK automatically polls at a configurable interval to provide continuous updates.

```typescript
import { KaleidoClient } from 'kaleidoswap-sdk';

const client = KaleidoClient.create({ baseUrl: 'https://api.signet.kaleidoswap.com' });

// Enable WebSocket (returns the WSClient; connect is lazy)
client.maker.enableWebSocket('wss://api.signet.kaleidoswap.com/ws');

// Stream quotes for a specific ticker pair (auto-discovers best route)
const stop = await client.maker.streamQuotesByTicker(
  'BTC',
  'USDT',
  10_000_000,                          // amount in smallest units (0.1 BTC)
  (quote) => console.log('Quote:', quote),
  { pollInterval: 2000 },              // refresh every 2 s
);

// Stream quotes for all available routes simultaneously
const stoppers = await client.maker.streamQuotesForAllRoutes(
  'BTC',
  'USDT',
  10_000_000,
  (route, quote) => console.log(`[${route}]`, quote),
);

// Stop all
for (const stop of stoppers.values()) stop();

// Discover available routes without streaming
const routes = await client.maker.getAvailableRoutes('BTC', 'USDT');
// [{ from_layer: 'BTC_LN', to_layer: 'RGB_LN' }, …]
```

The `WSClient` automatically reconnects with exponential backoff (up to 5 attempts by default) and sends periodic pings to keep the connection alive.

## Error Handling

All SDK errors extend `KaleidoError`. Use `instanceof` checks for precise handling.

```typescript
import {
  KaleidoError,
  APIError,
  ValidationError,
  NetworkError,
  TimeoutError,
  NotFoundError,
  QuoteExpiredError,
  RateLimitError,
} from 'kaleidoswap-sdk';

try {
  const quote = await client.maker.getQuote({ /* … */ });
} catch (error) {
  if (error instanceof QuoteExpiredError) {
    // Request a fresh quote
  } else if (error instanceof RateLimitError) {
    console.log(`Retry after ${error.retryAfter}s`);
  } else if (error instanceof ValidationError) {
    console.log('Bad request:', error.message);
  } else if (error instanceof NetworkError || error instanceof TimeoutError) {
    console.log('Transient error — retryable:', error.isRetryable());
  } else if (error instanceof APIError) {
    console.log(`HTTP ${error.statusCode}:`, error.message);
  }
}
```

### Error classes

| Class | Code | When |
|-------|------|------|
| `APIError` | `API_ERROR` | Non-2xx HTTP response |
| `NetworkError` | `NETWORK_ERROR` | Connection or DNS failure |
| `ValidationError` | `VALIDATION_ERROR` | 400 / 422 from the API |
| `TimeoutError` | `TIMEOUT_ERROR` | 408 / 504 or `timeout` config exceeded |
| `NotFoundError` | `NOT_FOUND` | 404 from the API |
| `RateLimitError` | `RATE_LIMIT` | 429 from the API |
| `QuoteExpiredError` | `QUOTE_EXPIRED` | Quote TTL elapsed before order creation |
| `SwapError` | `SWAP_ERROR` | Swap-specific failure |
| `WebSocketError` | `WEBSOCKET_ERROR` | WebSocket failure |
| `NodeNotConfiguredError` | `NODE_NOT_CONFIGURED` | RLN method called without `nodeUrl` |

`error.isRetryable()` returns `true` for `NETWORK_ERROR`, `TIMEOUT_ERROR`, and 5xx / 429 HTTP responses.

## Logging

The SDK is **silent by default**. Opt in by setting `logLevel` in the config or call `setComponentLogLevel` for finer control.

```typescript
import { KaleidoClient, LogLevel, setComponentLogLevel } from 'kaleidoswap-sdk';

// Global log level
const client = KaleidoClient.create({
  baseUrl: 'https://api.signet.kaleidoswap.com',
  logLevel: LogLevel.INFO,  // or the string 'info'
});

// Silence the HTTP sub-component while keeping everything else
setComponentLogLevel('http', LogLevel.WARN);

// Plug in your own logger (Winston, Pino, etc.)
const client = KaleidoClient.create({
  baseUrl:  'https://api.signet.kaleidoswap.com',
  logLevel: LogLevel.DEBUG,
  logger:   myWinstonLogger,  // must have debug/info/warn/error methods
});
```

Named sub-components: `kaleidoswap-sdk:http`, `kaleidoswap-sdk:ws`, `kaleidoswap-sdk:maker`, `kaleidoswap-sdk:rln`.

## Utilities

### `PrecisionHandler` — amount conversion

```typescript
import { createPrecisionHandler } from 'kaleidoswap-sdk';

const { assets } = await client.maker.listAssets();
const precision = createPrecisionHandler(assets);

// Display ↔ raw conversion
const raw     = precision.toRawAmount(0.001, 'BTC');      // e.g. 100000 (satoshis * 10^3)
const display = precision.toDisplayAmount(100000, 'BTC');  // 0.001

// Order size validation
const result = precision.validateOrderSize(0.001, btcAsset);
// { valid: true } or { valid: false, error: '…' }
```

### `AssetPairMapper` — ticker-based lookup

```typescript
import { createAssetPairMapper } from 'kaleidoswap-sdk';

const { pairs } = await client.maker.listPairs();
const mapper = createAssetPairMapper({ pairs });

const btc  = mapper.findByTicker('BTC');           // Asset object
const usdt = mapper.findByTicker('USDT');
const pair = mapper.findPairByTickers('BTC', 'USDT');
const can  = mapper.canTrade(btc.asset_id, usdt.asset_id);  // boolean
const all  = mapper.getAllAssets();                 // Asset[]
```

## Examples

Runnable examples are in [`examples/`](./examples/). Run any of them with:

```bash
npx tsx examples/01_hello.ts
```

| File | What it shows |
|------|---------------|
| `01_hello.ts` | List assets and pairs |
| `02_get_quote.ts` | Request a price quote |
| `03_websocket.ts` | Real-time WebSocket quote streaming |
| `04_create_swap_order.ts` | Full quote → order creation flow |
| `05_quote_logging_demo.ts` | Logging configuration |
| `06_multi_route_streaming.ts` | Streaming quotes across all routes |
| `07_swap_demo.ts` | End-to-end swap with status polling |
| `08_advanced_market_data.ts` | Market data with helpers |
| `09_error_handling.ts` | Error types and recovery patterns |

## Documentation

Full usage guide, API reference, and examples at **https://docs.kaleidoswap.com/sdk/introduction**

## License

MIT
