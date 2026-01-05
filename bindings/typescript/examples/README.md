# TypeScript Examples

Quick start guide for running Kaleidoswap SDK TypeScript examples.

## Setup

### Prerequisites
- Node.js 18+
- pnpm (or npm)

### Install Dependencies & Build

```bash
cd bindings/typescript
pnpm install
pnpm run build:nodejs
```

Or use the Makefile from the project root:

```bash
make dev-typescript
```

## Running Examples

### Swap Example

Execute a complete BTC/LN to RGB/L1 atomic swap:

```bash
# Using environment variables (recommended)
KALEIDO_API_URL=http://localhost:8000 \
KALEIDO_NODE_URL=http://localhost:3001 \
npx ts-node --esm examples/swap_example.ts
```

Or use the Makefile:

```bash
make run-ts-example
```

### Custom Configuration

Set environment variables to point to different endpoints:

```bash
export KALEIDO_API_URL=https://api.staging.kaleidoswap.com
export KALEIDO_NODE_URL=https://node.staging.kaleidoswap.com
npx ts-node --esm examples/swap_example.ts
```

## Common Usage Patterns

### Quick Asset Lookup

```typescript
import { KaleidoClient, KaleidoConfig } from "../pkg-node/kaleidoswap_sdk.js";

const config = KaleidoConfig.withDefaults("http://localhost:8000");
const client = new KaleidoClient(config);

// List all assets
const assets = await client.listAssets();

// Get specific asset
const usdt = assets.find(a => a.ticker === "USDT");
console.log(`USDT precision: ${usdt.precision}`);
```

### Getting a Quote

```typescript
// Get quote using asset IDs and layers
const quote = await client.getQuoteByPair(
    "BTC/rgb:...",        // Pair string with RGB asset ID
    BigInt(600000),       // Amount as BigInt
    undefined,            // No to_amount (let API calculate)
    "BTC_LN",
    "RGB_L1"
);

console.log(`You'll receive: ${quote.to_asset.amount} ${quote.to_asset.ticker}`);
console.log(`Fee: ${quote.fee.final_fee}`);
```

### BigInt Handling

TypeScript bindings use `BigInt` for large numbers (amounts, u64 values):

```typescript
// Amounts
const amount = BigInt(600000);
const quote = await client.getQuoteByPair(ticker, amount, undefined, "BTC_LN", "RGB_L1");

// The response includes BigInt for amounts
console.log(typeof quote.from_asset.amount); // 'bigint'

// Convert for display
const displayAmount = Number(quote.from_asset.amount) / 100_000_000;
console.log(`${displayAmount} BTC`);
```

## Troubleshooting

### Node Info Succeeds (Unlike Python)

**Note**: The TypeScript/Wasm bindings handle `u64::MAX` correctly using `BigInt`, so `getNodeInfo()` should work without issues, unlike the Python SDK.

If you still encounter errors, use the recovery workaround included in the example.

### Quote Fails with 400 Error

**Issue**: Getting quote returns 400 Bad Request.

**Common Causes**:
1. **Amount too small**: Use at least 500,000 sats for most BTC pairs
2. **Wrong asset identifier**: Extract RGB ID from `protocol_ids` 
3. **Invalid layer combination**: Ensure pair supports requested layers

### Type Errors with protocol_ids

**Issue**: `protocol_ids` type is `unknown` or iteration fails.

**Solution**: The example includes a helper function that handles both `Map` and plain objects:

```typescript
function getAssetId(asset: any): string {
    if (!asset.protocol_ids) return asset.ticker;

    const entries = asset.protocol_ids instanceof Map 
        ? Array.from(asset.protocol_ids.entries())
        : Object.entries(asset.protocol_ids);

    // Find RGB ID
    for (const [key, value] of entries) {
        if (String(key).toLowerCase().includes("rgb"))
            return value as string;
    }
    
    return asset.ticker;
}
```

### Service Not Available

Verify your local services are running:

```bash
make check-services
```

Or manually:

```bash
curl http://localhost:8000/health
curl http://localhost:3001/nodeinfo
```

## Best Practices

1. **Always use `BigInt` for amounts** to avoid precision loss
2. **Use environment variables** for configuration
3. **Check service availability** before running examples
4. **Extract asset IDs from `protocol_ids`** for RGB assets
5. **Handle async operations** with proper error handling
6. **Type cast carefully** when working with generated bindings

## Build Targets

Different build targets for different environments:

```bash
# Node.js (for examples)
pnpm run build:nodejs

# Web (for browsers)
pnpm run build:web

# All targets
pnpm run build:all
```

## More Information

- [SDK Documentation](../../README.md)
- [API Reference](https://docs.kaleidoswap.com)
- [Web Assembly Guide](https://rustwasm.github.io/wasm-pack/)
