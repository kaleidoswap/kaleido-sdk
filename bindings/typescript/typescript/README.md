# @kaleidoswap/sdk

TypeScript SDK for the Kaleidoswap protocol - trade RGB assets on Lightning Network.

## Features

- 🌐 **Universal** - Works in browsers and Node.js via WebAssembly
- 📦 **Typed** - Full TypeScript support with BigInt for amounts
- ⚡ **Fast** - Direct WASM bindings, no JSON serialization overhead
- 🔒 **Safe** - Structured error handling with proper exception classes

## Installation

```bash
npm install @kaleidoswap/sdk
# or
pnpm add @kaleidoswap/sdk
# or
yarn add @kaleidoswap/sdk
```

## Quick Start

```typescript
import { KaleidoClient } from '@kaleidoswap/sdk';

// Create client (async factory)
const client = await KaleidoClient.create({
  baseUrl: 'https://api.kaleidoswap.com',
});

// List assets
const assets = await client.listAssets();
console.log(assets.map((a) => a.ticker)); // ["BTC", "USDT", ...]

// Get a quote
const quote = await client.getQuote(
  'BTC/USDT',
  100000n, // 0.001 BTC in satoshis (BigInt)
  null,
  'BTC_LN', // From Lightning
  'RGB_LN', // To RGB Lightning
);

console.log(`Rate: ${quote.rate}`);
console.log(`You receive: ${quote.to_asset.amount} smallest units`);
```

## Amount Handling

All amount fields use JavaScript `number` for API compatibility:

```typescript
// Amounts are in smallest units (satoshis for BTC)
const fromAmount = 1_000_000; // 0.01 BTC

// Convert to/from display units
import { toDisplayUnits, toSmallestUnits } from '@kaleidoswap/sdk';

const displayAmount = await toDisplayUnits(1_000_000, 8); // 0.01
const smallestUnits = await toSmallestUnits(0.01, 8); // 1000000
```

> **Note on Precision:** JavaScript numbers are safe up to 2^53 (9,007,199,254,740,991). For amounts exceeding this (e.g., very large satoshi values), consider converting to `BigInt` for precision-critical operations.

## Error Handling

Errors are typed and can be caught using `instanceof`:

```typescript
import { KaleidoClient, APIError, NotFoundError, ValidationError } from '@kaleidoswap/sdk';

try {
  const asset = await client.getAssetByTicker('INVALID');
} catch (error) {
  if (error instanceof NotFoundError) {
    console.log('Asset not found');
  } else if (error instanceof APIError) {
    console.log(`API error (${error.statusCode}): ${error.message}`);
  } else if (error instanceof ValidationError) {
    console.log(`Invalid input: ${error.message}`);
  }
}
```

## API Reference

### KaleidoClient

#### Market Operations

- `listAssets()` - List all available assets
- `listPairs()` - List all trading pairs
- `listActiveAssets()` - List only active assets
- `listActivePairs()` - List only active trading pairs
- `getAssetByTicker(ticker)` - Get asset by ticker symbol
- `getPairByTicker(ticker)` - Get trading pair by ticker (e.g., "BTC/USDT")
- `getQuote(ticker, fromAmount, toAmount, fromLayer, toLayer)` - Get a swap quote

#### Order Operations

- `createSwapOrder(request)` - Create a new swap order
- `getSwapOrderStatus(orderId)` - Get order status
- `getOrderHistory(status?, limit?, skip?)` - Get order history

#### Node Operations

- `getNodeInfo()` - Get node information
- `getSwapStatus(paymentHash)` - Get swap status by payment hash

#### LSP Operations

- `getLspInfo()` - Get LSP information
- `estimateLspFees(channelSize)` - Estimate channel opening fees

### Layer Types

```typescript
type Layer =
  | 'BTC_L1' // Bitcoin on-chain
  | 'BTC_LN' // Bitcoin Lightning
  | 'RGB_L1' // RGB on-chain
  | 'RGB_LN' // RGB Lightning
  | 'BTC_SPARK'; // Bitcoin Spark
// ... and more
```

## Building from Source

```bash
# Install dependencies
npm install

# Build WASM and TypeScript
npm run build

# Run tests
npm test
```

## License

MIT
