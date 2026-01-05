# TypeScript SDK Examples

This directory contains examples demonstrating how to use the Kaleidoswap TypeScript SDK.

## Running Examples

First, build the SDK:

```bash
cd bindings/web/typescript
npm install
npm run build
```

Then run an example using `tsx` (TypeScript execution):

```bash
npx tsx examples/market-data.ts
```

Or compile first and run with Node.js:

```bash
npx tsc examples/market-data.ts --module nodenext --moduleResolution nodenext
node examples/market-data.js
```

## Examples

### market-data.ts

Basic market data queries:
- List available assets
- List trading pairs
- Get a quote for a swap

```typescript
import { KaleidoClient } from '@kaleidoswap/sdk';

const client = await KaleidoClient.create({
    baseUrl: 'https://api.regtest.kaleidoswap.com'
});

const assets = await client.listAssets();
const pairs = await client.listPairs();
```

### error-handling.ts

Error handling best practices:
- Typed exception hierarchy
- Retry strategies with exponential backoff
- Graceful degradation

```typescript
import { KaleidoClient, APIError, NetworkError, NotFoundError } from '@kaleidoswap/sdk';

try {
    const asset = await client.getAssetByTicker('UNKNOWN');
} catch (e) {
    if (e instanceof NotFoundError) {
        console.log('Asset not found');
    } else if (e instanceof NetworkError) {
        console.log('Network issue, will retry...');
    }
}
```

### create-order.ts

Creating swap orders:
- Get a quote
- Create order from quote
- Monitor order status

```typescript
// Get a quote
const quote = await client.getQuote(
    'BTC/USDT',
    BigInt(100000),  // 100k satoshis
    null,
    'BTC_LN',
    'RGB_LN'
);

// Create order
const order = await client.createSwapOrder({
    rfq_id: quote.rfq_id,
    from_asset: quote.from_asset,
    to_asset: quote.to_asset,
    receiver_address: { address: 'lnbc...', format: 'BOLT11' }
});

// Monitor status
const status = await client.getSwapOrderStatus(order.order_id);
```

## Environment Variables

- `KALEIDO_API_URL` - API base URL (default: https://api.regtest.kaleidoswap.com)
- `KALEIDO_NODE_URL` - RGB Lightning Node URL (optional, for direct node operations)

## BigInt Notes

All amount values in the SDK use JavaScript `BigInt` for precision:

```typescript
// Creating amounts
const amount = BigInt(100000);  // 100k satoshis

// From quote response
console.log(quote.from_asset.amount);  // BigInt

// Converting for display
const displayAmount = Number(amount) / 1e8;  // Convert to BTC
```
