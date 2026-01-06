# Kaleidoswap TypeScript/Node.js SDK

> [!CAUTION]
> **DEPRECATED**: This Node.js native binding is deprecated.
> 
> Please use the new unified WASM-based SDK instead:
> ```bash
> npm install @kaleidoswap/sdk
> ```
> 
> The new SDK works in **both browsers and Node.js** with:
> - BigInt support for precise amounts
> - Typed error classes for proper exception handling
> - No platform-specific native binaries
> 
> See [`bindings/typescript/`](../typescript/) for the new implementation.

---

TypeScript bindings for the Kaleidoswap SDK - trade RGB assets on Bitcoin Lightning Network.

## Installation

```bash
npm install @kaleidoswap/sdk
```

## Quick Start

```typescript
import { createClient } from '@kaleidoswap/sdk';

// Create a client
const client = createClient({
  baseUrl: 'https://api.regtest.kaleidoswap.com',
});

// List available assets
const assets = await client.listAssets();
console.log(`Found ${assets.length} assets`);

// Get asset by ticker
const btc = await client.getAssetByTicker('BTC');

// Get a quote
const quote = await client.getQuoteByPair('BTC/USDT', 1_000_000);
console.log(`Quote: ${quote.fromAmount} → ${quote.toAmount}`);
```

## Convenience Methods

### Amount Conversion

```typescript
// Convert display amount to atomic units
const raw = await client.toRaw(1.5, 'BTC'); // 150000000

// Convert atomic units back to display
const display = await client.toDisplay(raw, 'BTC'); // 1.5

// Flexible conversion
const amount = await client.convertAmount(2.5, 'BTC', 'raw');
```

### Validation & Trade Helpers

```typescript
// Check if pair is tradeable
const canTrade = await client.canTrade('BTC', 'USDT');

// Validate amount
const result = await client.validateAmount(0.01, 'BTC');
if (result.valid) {
  console.log(`Raw amount: ${result.rawAmount}`);
} else {
  console.log(`Errors: ${result.errors.join(', ')}`);
}

// Refresh cache
client.refreshCache();
```

### High-Level Swap Flows

```typescript
// Execute complete swap (init + whitelist + execute)
const initResult = await client.initSwap({
  rfq_id: quote.rfqId,
  from_asset: quote.fromAsset,
  to_asset: quote.toAsset,
  from_amount: quote.fromAmount,
  to_amount: quote.toAmount,
});

await client.whitelistTrade(initResult.swapstring);

await client.executeSwap({
  swapstring: initResult.swapstring,
  payment_hash: initResult.payment_hash,
  taker_pubkey: pubkey,
});

// Wait for completion
const status = await client.waitForSwapCompletion(
  initResult.payment_hash,
  180, // timeout seconds
  2,   // poll interval
);
```

## Examples

See the [examples/](examples/) directory for complete usage examples.
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
