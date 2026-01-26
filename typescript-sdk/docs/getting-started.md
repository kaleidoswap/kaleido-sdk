# Getting Started

This guide will help you get up and running with the Kaleidoswap TypeScript SDK.

## Installation

```bash
npm install kaleidoswap-sdk
# or
pnpm add kaleidoswap-sdk
# or
yarn add kaleidoswap-sdk
```

## Creating a Client

The `KaleidoClient` is the main entry point for interacting with the Kaleidoswap API:

```typescript
import { KaleidoClient } from 'kaleidoswap-sdk';

const client = KaleidoClient.create({
  baseUrl: 'https://api.kaleidoswap.com',
  // Optional configuration:
  nodeUrl: 'https://node.kaleidoswap.com',  // For RLN operations
  apiKey: 'your-api-key',                    // For authenticated requests
  timeout: 30,                                // Request timeout in seconds
  maxRetries: 3,                              // Maximum retry attempts
});
```

## Client Structure

The client provides two main sub-clients:

### Maker Client (`client.maker`)

For market operations - quotes, swaps, orders:

```typescript
// List available assets
const assets = await client.maker.listAssets();

// List trading pairs
const pairs = await client.maker.listPairs();

// Get a quote
const quote = await client.maker.getQuote({ ... });

// Create swap order
const order = await client.maker.createSwapOrder({ ... });

// Check order status
const status = await client.maker.getSwapOrderStatus({ order_id: '...' });
```

### RLN Client (`client.rln`)

For RGB Lightning Node operations (requires `nodeUrl`):

```typescript
// Check if node is configured
if (client.hasNode()) {
  // Get node info
  const info = await client.rln.getNodeInfo();
  
  // List channels
  const channels = await client.rln.listChannels();
  
  // Create invoice
  const invoice = await client.rln.createInvoice({ ... });
}
```

## Setting Up Helpers

For easier asset and amount handling, use the utility helpers:

```typescript
import { 
  KaleidoClient, 
  createAssetPairMapper, 
  createPrecisionHandler 
} from 'kaleidoswap-sdk';

const client = KaleidoClient.create({ baseUrl: API_URL });

// Fetch pairs and create helpers
const pairsResponse = await client.maker.listPairs();
const assetMapper = createAssetPairMapper(pairsResponse);
const precisionHandler = createPrecisionHandler(assetMapper.getAllAssets());

// Now you can easily find assets
const btc = assetMapper.findByTicker('BTC');
const usdt = assetMapper.findByTicker('USDT');

// And convert amounts
const rawAmount = precisionHandler.toRawAmount(0.001, btc.asset_id);  // To atomic units
const displayAmount = precisionHandler.toDisplayAmount(rawAmount, btc.asset_id);  // Back to display
```

## Complete Example: Getting a Quote

```typescript
import { 
  KaleidoClient, 
  createAssetPairMapper 
} from 'kaleidoswap-sdk';
import type { Layer } from 'kaleidoswap-sdk';

async function getQuote() {
  const client = KaleidoClient.create({ 
    baseUrl: 'https://api.kaleidoswap.com' 
  });

  // 1. Get trading pairs
  const pairs = await client.maker.listPairs();
  const mapper = createAssetPairMapper(pairs);

  // 2. Find assets
  const btc = mapper.findByTicker('BTC');
  const usdt = mapper.findByTicker('USDT');
  
  if (!btc || !usdt) {
    throw new Error('Assets not found');
  }

  // 3. Find trading pair and route
  const pair = mapper.findPairByTickers('BTC', 'USDT');
  const route = pair?.routes?.[0];
  
  if (!route) {
    throw new Error('No route available');
  }

  // 4. Get quote
  const quote = await client.maker.getQuote({
    from_asset: {
      asset_id: btc.asset_id,
      layer: route.from_layer as Layer,
      amount: 10000000,  // 0.1 BTC in satoshis
    },
    to_asset: {
      asset_id: usdt.asset_id,
      layer: route.to_layer as Layer,
    },
  });

  console.log(`Quote: ${quote.from_asset.amount} ${quote.from_asset.ticker}`);
  console.log(`  →    ${quote.to_asset.amount} ${quote.to_asset.ticker}`);
  console.log(`Price: ${quote.price}`);
  console.log(`Expires: ${new Date(quote.expires_at).toLocaleString()}`);
  
  return quote;
}
```

## WebSocket for Real-time Quotes

For streaming quotes in real-time:

```typescript
// Enable WebSocket
const clientId = crypto.randomUUID();
client.maker.enableWebSocket(`wss://api.kaleidoswap.com/ws/${clientId}`);

// Stream quotes
const unsubscribe = await client.maker.streamQuotes(
  'btc',        // from asset
  'usdt',       // to asset  
  10000000,     // amount
  'BTC_LN',     // from layer
  'RGB_LN',     // to layer
  (quote) => {
    console.log('New quote:', quote.price);
  }
);

// Later: stop streaming
unsubscribe();
```

## Next Steps

- [Utilities](./utilities.md) - Learn about AssetPairMapper and PrecisionHandler
- [Examples](./examples.md) - See more code examples
- [Error Handling](./error-handling.md) - Handle errors properly
