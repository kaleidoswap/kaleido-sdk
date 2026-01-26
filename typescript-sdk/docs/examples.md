# Examples

This page provides code examples for common tasks with the Kaleidoswap SDK.

## Example Files

The SDK includes runnable example files in the `examples/` directory:

| File | Description |
|------|-------------|
| `01_hello.ts` | Basic client setup and fetching assets |
| `02_get_quote.ts` | Getting a swap quote |
| `03_websocket.ts` | Real-time quote streaming via WebSocket |
| `04_create_swap_order.ts` | Complete swap order creation flow |
| `05_quote_logging_demo.ts` | Quote logging and monitoring |
| `06_multi_route_streaming.ts` | Streaming quotes for all routes |
| `07_swap_demo.ts` | Complete swap demonstration |
| `08_advanced_market_data.ts` | Advanced market operations |
| `09_error_handling.ts` | Error handling patterns |

Run examples with:
```bash
npx tsx examples/01_hello.ts
```

---

## Basic Usage

### Fetching Available Assets

```typescript
import { KaleidoClient } from 'kaleidoswap-sdk';

const client = KaleidoClient.create({
  baseUrl: 'https://api.kaleidoswap.com'
});

const response = await client.maker.listAssets();

for (const asset of response.assets) {
  console.log(`${asset.ticker} - ${asset.name} (precision: ${asset.precision})`);
}
```

### Fetching Trading Pairs

```typescript
const pairs = await client.maker.listPairs();

for (const pair of pairs.pairs) {
  console.log(`${pair.base.ticker}/${pair.quote.ticker}`);
  console.log(`  Routes: ${pair.routes?.length || 0}`);
  console.log(`  Active: ${pair.is_active}`);
}
```

---

## Working with Assets

### Using AssetPairMapper

```typescript
import { KaleidoClient, createAssetPairMapper } from 'kaleidoswap-sdk';

const client = KaleidoClient.create({ baseUrl: API_URL });
const pairs = await client.maker.listPairs();
const mapper = createAssetPairMapper(pairs);

// Find by ticker
const btc = mapper.findByTicker('BTC');
const usdt = mapper.findByTicker('USDT');

// Check if can trade
if (mapper.canTradeByTicker('BTC', 'USDT')) {
  console.log('BTC/USDT trading available');
}

// Get all trading partners
const partners = mapper.getTradingPartners(btc.asset_id);
console.log(`BTC can trade with: ${partners.map(p => p.ticker).join(', ')}`);
```

### Converting Amounts

```typescript
import { createPrecisionHandler, toRawAmount, toDisplayAmount } from 'kaleidoswap-sdk';

// Simple conversion with known precision
const sats = toRawAmount(0.5, 8);     // 50000000
const btc = toDisplayAmount(sats, 8); // 0.5

// Using PrecisionHandler with asset data
const precision = createPrecisionHandler(mapper.getAllAssets());

const raw = precision.toRawAmount(100, usdtAssetId);
const display = precision.toDisplayAmount(raw, usdtAssetId);
```

---

## Getting Quotes

### Simple Quote Request

```typescript
import type { Layer } from 'kaleidoswap-sdk';

const quote = await client.maker.getQuote({
  from_asset: {
    asset_id: btc.asset_id,
    layer: 'BTC_LN' as Layer,
    amount: 10000000,  // 0.1 BTC
  },
  to_asset: {
    asset_id: usdt.asset_id,
    layer: 'RGB_LN' as Layer,
  },
});

console.log(`Quote ID: ${quote.rfq_id}`);
console.log(`From: ${quote.from_asset.amount} ${quote.from_asset.ticker}`);
console.log(`To: ${quote.to_asset.amount} ${quote.to_asset.ticker}`);
console.log(`Price: ${quote.price}`);
console.log(`Expires: ${new Date(quote.expires_at).toLocaleString()}`);
```

### Quote with Route Discovery

```typescript
// Find available routes
const pair = mapper.findPairByTickers('BTC', 'USDT');

if (pair?.routes && pair.routes.length > 0) {
  console.log('Available routes:');
  for (const route of pair.routes) {
    console.log(`  ${route.from_layer} → ${route.to_layer}`);
  }
  
  // Use first route
  const route = pair.routes[0];
  
  const quote = await client.maker.getQuote({
    from_asset: {
      asset_id: btc.asset_id,
      layer: route.from_layer as Layer,
      amount: 10000000,
    },
    to_asset: {
      asset_id: usdt.asset_id,
      layer: route.to_layer as Layer,
    },
  });
}
```

---

## WebSocket Streaming

### Basic Quote Streaming

```typescript
// Enable WebSocket
const clientId = crypto.randomUUID();
client.maker.enableWebSocket(`wss://api.kaleidoswap.com/ws/${clientId}`);

// Stream quotes
const unsubscribe = await client.maker.streamQuotes(
  'btc',        // from asset
  'usdt',       // to asset
  10000000,     // 0.1 BTC
  'BTC_LN',     // from layer
  'RGB_LN',     // to layer
  (quote) => {
    console.log(`New quote: ${quote.price}`);
    console.log(`  Amount: ${quote.to_amount}`);
  }
);

// Stop after 30 seconds
setTimeout(() => {
  unsubscribe();
  console.log('Stopped streaming');
}, 30000);
```

### Stream by Ticker (Auto Route Discovery)

```typescript
const unsubscribe = await client.maker.streamQuotesByTicker(
  'BTC',
  'USDT',
  10000000,
  (quote) => console.log('Quote:', quote),
  { preferredFromLayer: 'BTC_LN', preferredToLayer: 'RGB_LN' }
);
```

### Stream All Routes

```typescript
const unsubscribers = await client.maker.streamQuotesForAllRoutes(
  'BTC',
  'USDT',
  10000000,
  (route, quote) => {
    console.log(`[${route}] Price: ${quote.price}`);
  }
);

// Stop all streams
setTimeout(() => {
  for (const [route, unsub] of unsubscribers) {
    unsub();
    console.log(`Stopped ${route}`);
  }
}, 30000);
```

---

## Creating Swap Orders

### Complete Swap Flow

```typescript
import { 
  KaleidoClient, 
  createAssetPairMapper, 
  createPrecisionHandler 
} from 'kaleidoswap-sdk';
import type { Layer, ReceiverAddressFormat } from 'kaleidoswap-sdk';

async function executeSwap() {
  const client = KaleidoClient.create({ baseUrl: API_URL });
  
  // 1. Setup helpers
  const pairs = await client.maker.listPairs();
  const mapper = createAssetPairMapper(pairs);
  const precision = createPrecisionHandler(mapper.getAllAssets());
  
  // 2. Find assets
  const btc = mapper.findByTicker('BTC')!;
  const usdt = mapper.findByTicker('USDT')!;
  
  // 3. Validate amount
  const amount = 0.001;
  const validation = precision.validateOrderSize(amount, btc);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  // 4. Get route
  const pair = mapper.findPairByTickers('BTC', 'USDT')!;
  const route = pair.routes![0];
  
  // 5. Get quote
  const quote = await client.maker.getQuote({
    from_asset: {
      asset_id: btc.asset_id,
      layer: route.from_layer as Layer,
      amount: validation.rawAmount,
    },
    to_asset: {
      asset_id: usdt.asset_id,
      layer: route.to_layer as Layer,
    },
  });
  
  // 6. Create order
  const order = await client.maker.createSwapOrder({
    rfq_id: quote.rfq_id,
    from_asset: {
      asset_id: quote.from_asset.asset_id,
      name: btc.name,
      ticker: quote.from_asset.ticker,
      layer: quote.from_asset.layer,
      amount: quote.from_asset.amount,
      precision: btc.precision,
    },
    to_asset: {
      asset_id: quote.to_asset.asset_id,
      name: usdt.name,
      ticker: quote.to_asset.ticker,
      layer: quote.to_asset.layer,
      amount: quote.to_asset.amount,
      precision: usdt.precision,
    },
    receiver_address: {
      address: 'your-rgb-invoice-here',
      format: 'RGB_INVOICE' as ReceiverAddressFormat,
    },
    min_onchain_conf: 1,
  });
  
  console.log(`Order created: ${order.id}`);
  console.log(`Status: ${order.status}`);
  
  // 7. Wait for completion
  const finalOrder = await client.maker.waitForSwapCompletion(order.id, {
    timeout: 300000,  // 5 minutes
    pollInterval: 2000,
    onStatusUpdate: (status) => console.log(`Status: ${status}`),
  });
  
  console.log(`Final status: ${finalOrder.status}`);
}
```

---

## Error Handling Example

```typescript
import { 
  APIError, 
  ValidationError, 
  QuoteExpiredError,
  NetworkError 
} from 'kaleidoswap-sdk';

async function safeGetQuote() {
  try {
    const quote = await client.maker.getQuote({ ... });
    return quote;
  } catch (error) {
    if (error instanceof QuoteExpiredError) {
      console.log('Quote expired - getting new quote');
      return await client.maker.getQuote({ ... });
    }
    
    if (error instanceof ValidationError) {
      console.error('Invalid parameters:', error.message);
      throw error;
    }
    
    if (error instanceof NetworkError) {
      console.error('Network issue - check connection');
      throw error;
    }
    
    if (error instanceof APIError) {
      console.error(`API error (${error.statusCode}):`, error.message);
      if (error.isRetryable()) {
        // Implement retry logic
      }
      throw error;
    }
    
    throw error;
  }
}
```

---

## Environment Variables

All examples support these environment variables:

```bash
# API endpoint (default: http://localhost:8000)
export KALEIDO_API_URL=https://api.kaleidoswap.com

# RLN Node URL (for node operations)
export KALEIDO_NODE_URL=https://node.kaleidoswap.com
```
