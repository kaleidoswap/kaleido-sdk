# Kaleidoswap TypeScript/Node.js SDK

TypeScript bindings for the Kaleidoswap SDK - trade RGB assets on Bitcoin Lightning Network.

## Installation

```bash
npm install @kaleidoswap/sdk
# or
yarn add @kaleidoswap/sdk
```

## Quick Start

```typescript
import { createClient } from '@kaleidoswap/sdk';

// Create a client
const client = createClient({
  baseUrl: 'https://api.regtest.kaleidoswap.com',
  timeout: 30.0,
  maxRetries: 3,
  cacheTtl: 60,
});

// List available assets
const assets = await client.listAssets();
console.log(JSON.parse(assets));

// List trading pairs
const pairs = await client.listPairs();
console.log(JSON.parse(pairs));

// Get a quote (returns JSON string)
// Use getBestQuote for optimal routing (supports cross-protocol)
const quoteJson = await client.getBestQuote('BTC/USDT', 1000000); // 1M sats
const quote = JSON.parse(quoteJson);

// Access nested fields
const fromAmt = quote.from_asset?.amount || 0;
const toAmt = quote.to_asset?.amount || 0;
console.log(`Quote: ${fromAmt} -> ${toAmt}`);

// Legacy operations (Strongly Typed)
// Methods accept objects matching defined interfaces (e.g., CreateOrderRequest)
const initRequest = {
  rfq_id: quote.rfq_id,
  from_asset: quote.from_asset.asset_id,
  to_asset: quote.to_asset.asset_id,
  from_amount: quote.from_asset.amount,
  to_amount: quote.to_asset.amount,
};

const initResultJson = await client.initSwap(initRequest);
const initResult = JSON.parse(initResultJson);
console.log(`Swap Initiated: ${initResult.payment_hash}`);
```

## Configuration

```typescript
interface KaleidoConfig {
  baseUrl: string;       // Kaleidoswap API URL
  nodeUrl?: string;      // Optional RGB Lightning Node URL
  timeout?: number;      // Request timeout in seconds (default: 30)
  maxRetries?: number;   // Max retry attempts (default: 3)
  cacheTtl?: number;     // Cache TTL in seconds (default: 60)
}
```

## Development

### Building from Source

Requires Rust and Node.js:

```bash
# Install dependencies
npm install

# Build native module and TypeScript
npm run build
```

### Running Tests

```bash
npm test
```

## License

MIT License - see [LICENSE](../../LICENSE) for details.
