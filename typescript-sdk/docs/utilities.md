# Utilities

The Kaleidoswap SDK includes utility classes to make working with assets and amounts easier.

## AssetPairMapper

The `AssetPairMapper` helps you work with trading pairs without juggling asset IDs manually. It builds a map of all available assets and their trading relationships.

### Creating an AssetPairMapper

```typescript
import { createAssetPairMapper } from 'kaleidoswap-sdk';

// Fetch pairs from the API
const pairsResponse = await client.maker.listPairs();

// Create the mapper
const assetMapper = createAssetPairMapper(pairsResponse);
```

### Finding Assets

Find assets by ticker symbol:

```typescript
const btc = assetMapper.findByTicker('BTC');
const usdt = assetMapper.findByTicker('USDT');

if (btc) {
  console.log(`BTC Asset ID: ${btc.asset_id}`);
  console.log(`Precision: ${btc.precision} decimal places`);
  console.log(`Min Order: ${btc.min_order_size}`);
  console.log(`Max Order: ${btc.max_order_size}`);
}
```

Find by asset ID:

```typescript
const asset = assetMapper.findById('rgb:MVGWqOeU-hlXzBfR-...');
```

Get all available assets:

```typescript
const allAssets = assetMapper.getAllAssets();

for (const asset of allAssets) {
  console.log(`${asset.ticker}: ${asset.name}`);
}
```

### Checking Trade Availability

Before requesting a quote, check if two assets can be traded:

```typescript
// By ticker
const canSwap = assetMapper.canTradeByTicker('BTC', 'USDT');

// By asset ID
const canSwapById = assetMapper.canTrade(btc.asset_id, usdt.asset_id);
```

### Getting Trading Partners

Find all assets that can be traded with a specific asset:

```typescript
const partners = assetMapper.getTradingPartners(btc.asset_id);

for (const partner of partners) {
  console.log(`Can trade BTC for ${partner.ticker}`);
}
```

### Working with Trading Pairs

Get all active trading pairs:

```typescript
const activePairs = assetMapper.getActivePairs();
```

Find a specific pair:

```typescript
const btcUsdtPair = assetMapper.findPairByTickers('BTC', 'USDT');

if (btcUsdtPair) {
  console.log(`Routes available: ${btcUsdtPair.routes?.length}`);
  
  for (const route of btcUsdtPair.routes || []) {
    console.log(`  ${route.from_layer} → ${route.to_layer}`);
  }
}
```

### MappedAsset Interface

Assets returned by the mapper include:

```typescript
interface MappedAsset {
  asset_id: string;           // Unique identifier
  ticker: string;             // Display ticker (BTC, USDT, etc.)
  name: string;               // Full name
  precision: number;          // Decimal places
  is_active: boolean;         // Trading status
  min_order_size: number;     // Minimum order (atomic units)
  max_order_size: number;     // Maximum order (atomic units)
  trading_pairs: string[];    // Asset IDs this can trade with
  protocol_ids: { [key: string]: string };  // IDs per protocol
}
```

---

## PrecisionHandler

The `PrecisionHandler` converts between display amounts (human-readable) and raw amounts (atomic units).

Users think in "0.5 BTC" but APIs work with "50000000000 satoshis" (for precision 11). The precision handler manages this conversion.

### Creating a PrecisionHandler

```typescript
import { createPrecisionHandler } from 'kaleidoswap-sdk';

// Get assets from the mapper
const assets = assetMapper.getAllAssets();

// Create the handler
const precisionHandler = createPrecisionHandler(assets);
```

### Converting Amounts

**Display → Raw (for API calls):**

```typescript
// User wants to swap 0.001 BTC
const displayAmount = 0.001;
const rawAmount = precisionHandler.toRawAmount(displayAmount, btc.asset_id);

// Use rawAmount in API calls
const quote = await client.maker.getQuote({
  from_asset: { 
    asset_id: btc.asset_id, 
    layer: 'BTC_LN', 
    amount: rawAmount 
  },
  // ...
});
```

**Raw → Display (for UI):**

```typescript
// API returns raw amount
const rawFromApi = quote.to_asset.amount;

// Convert for display
const displayAmount = precisionHandler.toDisplayAmount(rawFromApi, usdt.asset_id);
console.log(`You will receive ${displayAmount} USDT`);
```

### Formatting Amounts

Format with correct decimal places:

```typescript
const formatted = precisionHandler.formatDisplayAmount(0.123456789, btc.asset_id);
// Returns "0.12345678900" for BTC with precision 11
```

### Validating Order Sizes

Check if an amount is within allowed limits:

```typescript
const validation = precisionHandler.validateOrderSize(0.001, btc);

if (validation.valid) {
  console.log(`Valid! Raw amount: ${validation.rawAmount}`);
} else {
  console.log(`Invalid: ${validation.error}`);
}

// Validation result includes:
// - valid: boolean
// - error?: string
// - rawAmount: number
// - minRawAmount: number
// - maxRawAmount: number
```

### Getting Order Size Limits

```typescript
const limits = precisionHandler.getOrderSizeLimits(btc);

console.log(`Min: ${limits.minDisplayAmount} BTC`);
console.log(`Max: ${limits.maxDisplayAmount} BTC`);
console.log(`Precision: ${limits.precision} decimal places`);
```

---

## Standalone Functions

For simple conversions when you know the precision:

```typescript
import { toRawAmount, toDisplayAmount } from 'kaleidoswap-sdk';

// Convert 1.5 to raw with precision 8
const raw = toRawAmount(1.5, 8);  // 150000000

// Convert back
const display = toDisplayAmount(150000000, 8);  // 1.5
```

---

## Complete Example

```typescript
import { 
  KaleidoClient, 
  createAssetPairMapper, 
  createPrecisionHandler 
} from 'kaleidoswap-sdk';

async function main() {
  const client = KaleidoClient.create({ baseUrl: API_URL });
  
  // Setup helpers
  const pairs = await client.maker.listPairs();
  const mapper = createAssetPairMapper(pairs);
  const precision = createPrecisionHandler(mapper.getAllAssets());
  
  // Find assets
  const btc = mapper.findByTicker('BTC');
  const usdt = mapper.findByTicker('USDT');
  
  if (!btc || !usdt) {
    throw new Error('Assets not found');
  }
  
  // Check if tradable
  if (!mapper.canTrade(btc.asset_id, usdt.asset_id)) {
    throw new Error('Cannot trade BTC/USDT');
  }
  
  // Validate amount
  const amount = 0.001; // User wants to swap 0.001 BTC
  const validation = precision.validateOrderSize(amount, btc);
  
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  // Get pair and route
  const pair = mapper.findPairByTickers('BTC', 'USDT');
  const route = pair?.routes?.[0];
  
  // Get quote using validated raw amount
  const quote = await client.maker.getQuote({
    from_asset: {
      asset_id: btc.asset_id,
      layer: route.from_layer,
      amount: validation.rawAmount,
    },
    to_asset: {
      asset_id: usdt.asset_id,
      layer: route.to_layer,
    },
  });
  
  // Display result
  const receiveAmount = precision.toDisplayAmount(quote.to_asset.amount, usdt.asset_id);
  console.log(`Swap ${amount} BTC → ${receiveAmount} USDT`);
}
```
