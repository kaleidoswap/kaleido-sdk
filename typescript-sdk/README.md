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

`KaleidoClient` organizes its functionality into two sub-clients that can be used **independently or together**:

| Sub-client | Config key | What it covers | Requires |
|---|---|---|---|
| `client.maker` | `baseUrl` | KaleidoSwap market API — assets, quotes, swap orders, atomic swaps, LSP | Public API URL |
| `client.rln` | `nodeUrl` | Your RGB Lightning Node — wallet, channels, payments, RGB assets | Running RLN daemon |

### KaleidoSwap API only — no RLN node required

```typescript
import { KaleidoClient } from 'kaleidoswap-sdk';

const client = KaleidoClient.create({ baseUrl: 'https://api.signet.kaleidoswap.com' });
const assets = await client.maker.listAssets();
const pairs  = await client.maker.listPairs();
```

### RLN node only — no KaleidoSwap API required

```typescript
const client = KaleidoClient.create({ nodeUrl: 'http://localhost:3001' });
const info     = await client.rln.getNodeInfo();
const channels = await client.rln.listChannels();
```

### Both together — full swap flow

```typescript
const client = KaleidoClient.create({
  baseUrl: 'https://api.signet.kaleidoswap.com',
  nodeUrl: 'http://localhost:3001',
});
const pairs    = await client.maker.listPairs();
const channels = await client.rln.listChannels();
```

### Zero-config — defaults to regtest, no node

```typescript
const client = KaleidoClient.create();
const assets = await client.maker.listAssets();
```

## Configuration

All fields are optional. `KaleidoClient.create()` with no arguments connects to regtest.

```typescript
const client = KaleidoClient.create({
  baseUrl:    'https://api.signet.kaleidoswap.com', // Maker API URL (default: regtest)
  nodeUrl:    'http://localhost:3001',               // RGB Lightning Node URL
  apiKey:     'your-api-key',                        // Optional API key
  timeout:    30,                                    // Request timeout in seconds (default: 30)
  maxRetries: 3,                                     // Auto-retry count (default: 3)
  logLevel:   'info',                                // 'debug' | 'info' | 'warn' | 'error' | 'silent'
  logger:     myLogger,                              // Custom logger (Winston, Pino, console, …)
});
```

| Environment | `baseUrl` |
|-------------|-----------|
| Regtest (default) | `https://api.regtest.kaleidoswap.com` |
| Signet | `https://api.signet.kaleidoswap.com` |

## API Reference

### `client.maker` — KaleidoSwap API

| Group | Key methods |
|-------|-------------|
| Market | `listAssets`, `listPairs`, `getQuote`, `getPairRoutes`, `getMarketRoutes` |
| Swap Orders | `createSwapOrder`, `getSwapOrderStatus`, `waitForSwapCompletion`, `getOrderHistory`, `getOrderAnalytics` |
| Atomic Swaps | `initSwap`, `executeSwap`, `getAtomicSwapStatus`, `getSwapNodeInfo` |
| LSP (LSPS1) | `getLspInfo`, `getLspNetworkInfo`, `estimateLspFees`, `createLspOrder`, `getLspOrder` |
| WebSocket | `enableWebSocket`, `streamQuotesByTicker`, `streamQuotesForAllRoutes`, `getAvailableRoutes` |

WebSocket streaming requires `client.maker.enableWebSocket('wss://api.signet.kaleidoswap.com/ws')` and auto-reconnects with exponential backoff.

### `client.rln` — RGB Lightning Node

Requires `nodeUrl` in the config. Exposes full RGB Lightning Node control: `getNodeInfo`, `getAddress`, `getBalance`, `listChannels`, `listAssets`, and payment methods.

## Error Handling

All errors extend `KaleidoError`. Use `instanceof` for precise handling.

| Class | When |
|-------|------|
| `APIError` | Non-2xx HTTP response |
| `ValidationError` | 400 / 422 from the API |
| `TimeoutError` | 408 / 504 or `timeout` config exceeded |
| `NotFoundError` | 404 from the API |
| `RateLimitError` | 429 — check `error.retryAfter` |
| `QuoteExpiredError` | Quote TTL elapsed before order creation |
| `NetworkError` | Connection or DNS failure |
| `NodeNotConfiguredError` | RLN method called without `nodeUrl` |

`error.isRetryable()` returns `true` for network, timeout, and 5xx / 429 responses.

## Utilities

```typescript
import { createPrecisionHandler, createAssetPairMapper } from 'kaleidoswap-sdk';

// Amount conversion
const precision = createPrecisionHandler(assets);
const raw     = precision.toRawAmount(0.001, 'BTC');
const display = precision.toDisplayAmount(100000, 'BTC');

// Ticker-based asset lookup
const mapper = createAssetPairMapper({ pairs });
const btc  = mapper.findByTicker('BTC');
const pair = mapper.findPairByTickers('BTC', 'USDT');
```

## Examples

Runnable examples are in [`examples/`](./examples/). Run any with `npx tsx examples/<file>`.

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
