# KaleidoSwap SDK Examples

Examples demonstrating how to use the KaleidoSwap TypeScript SDK with proper asset mapping and precision handling.

## Core Utilities

### Asset Pair Mapper
**File:** `src/utils/assetPairMapper.ts`

Creates a comprehensive asset list from trading pairs data with:
- Asset information extracted from pairs
- Trading relationship mapping
- Order size limits per asset
- Precision information per asset

```typescript
import { createAssetPairMapper } from '../src/utils';

const pairs = await client.listPairs();
const assetMapper = createAssetPairMapper(pairs);

// Find assets by ticker
const btc = assetMapper.findByTicker('BTC');
const usdt = assetMapper.findByTicker('USDT');

// Check trading compatibility
const canTrade = assetMapper.canTrade(btc.asset_id, usdt.asset_id);
```

### Precision Handler
**File:** `src/utils/precisionHandler.ts`

Handles amount conversions between decimal and atomic units:
- Convert decimal amounts to atomic units for API calls
- Convert atomic amounts back to decimal for display
- Validate order size limits
- Format amounts with proper precision

```typescript
import { createPrecisionHandler } from '../src/utils';

const allAssets = assetMapper.getAllAssets();
const precisionHandler = createPrecisionHandler(allAssets);

// Convert 0.001 BTC to atomic units (satoshis)
const atomicAmount = precisionHandler.toAtomicAmount(0.001, btc.asset_id);

// Validate order size
const validation = precisionHandler.validateOrderSize(0.001, btc);
```

## Swap Examples

### BTC to USDT Swap (Selling BTC)
**File:** `btc-to-usdt-swap.ts`

Demonstrates selling BTC to receive USDT with proper precision handling:

1. **Get trading pairs** → `client.listPairs()`
2. **Create asset mapper** → `createAssetPairMapper(pairs)`
3. **Create precision handler** → `createPrecisionHandler(assets)`
4. **Find assets** → `assetMapper.findByTicker('BTC')`
5. **Validate amount** → `precisionHandler.validateOrderSize(0.001, btc)`
6. **Get quote** → `client.getQuote()` with atomic amount
7. **Initialize swap** → `client.initMakerSwap()`
8. **Monitor status** → `client.getSwapStatus()`

### USDT to BTC Swap (Buying BTC)
**File:** `usdt-to-btc-swap.ts`

Demonstrates buying BTC with USDT using the same precision-aware flow.

## How to Run Examples

### Method 1: Using npm scripts
```bash
# BTC to USDT swap
npm run example:btc-to-usdt

# USDT to BTC swap  
npm run example:usdt-to-btc
```

### Method 2: Direct execution
```bash
ts-node examples/btc-to-usdt-swap.ts
ts-node examples/usdt-to-btc-swap.ts
```

## Key Features

### Precision Handling
The examples properly handle precision by:
- **Converting decimal amounts to atomic units** before API calls
- **Validating order sizes** against min/max limits
- **Converting atomic responses back to decimal** for display
- **Showing both atomic and decimal amounts** for transparency

Example precision handling:
```typescript
// Input: 0.001 BTC (decimal)
const decimalAmount = 0.001;

// Validate against order limits
const validation = precisionHandler.validateOrderSize(decimalAmount, btc);
// validation.atomicAmount = 100000 (for BTC with precision 11)

// Use atomic amount in API call
const quote = await client.getQuote(btc.asset_id, usdt.asset_id, validation.atomicAmount, 'from');

// Convert response back to decimal for display
const fromDecimal = precisionHandler.toDecimalAmount(quote.from_amount, btc.asset_id);
const toDecimal = precisionHandler.toDecimalAmount(quote.to_amount, usdt.asset_id);
```

### Asset Discovery
Assets are automatically discovered from trading pairs:
- **No separate asset endpoint needed** - all asset info comes from pairs
- **Precision extracted from pairs** - each asset gets proper precision
- **Order limits included** - min/max order sizes per asset
- **Trading relationships mapped** - know which assets can trade

### Error Handling
Comprehensive error handling for:
- **Asset not found** - when ticker doesn't exist
- **No trading pair** - when assets can't be traded
- **Order size validation** - amount too small/large
- **Precision errors** - invalid conversions
- **API errors** - network or server issues

## Configuration

Update client configuration:
```typescript
const client = new KaleidoClient({
  baseUrl: 'https://api.staging.kaleidoswap.com/api/v1', // your API URL
  // nodeUrl removed - not needed for basic swaps
});
```

## Example Output

When you run the examples, you'll see:
```
Starting BTC to USDT swap...

Fetching trading pairs...
Creating asset pair mapper...

Available assets:
- BTC (BTC)
  Precision: 11
  Order limits: 0.00001 - 10 BTC
- USDT (rgb:dqkv_MLl-iiN2WLU-DKAVEkN-tJVc1pR-YCOV184-mQiUCk4)
  Precision: 6
  Order limits: 2 - 1000000 USDT

Finding BTC and USDT assets...
Found: BTC (BTC) and USDT (rgb:dqkv_MLl-iiN2WLU-DKAVEkN-tJVc1pR-YCOV184-mQiUCk4)

Preparing to swap 0.001 BTC...
Amount validation passed:
- Decimal amount: 0.001 BTC
- Atomic amount: 100000 units

Getting quote...
Quote received:
- From: 0.001 BTC
- To: 45.5 USDT
- Fee: 0.1 USDT
- Price: 45500
- RFQ ID: abc123...

Initializing swap...
Swap initialized:
- Payment hash: def456...
- Swapstring: 100000/BTC/45400000/rgb:dqkv...

Monitoring swap status...
[1/30] Status: Pending
[2/30] Status: Succeeded

✅ Swap completed successfully!
Final result: Swapped 0.001 BTC for 45.5 USDT
```

## Troubleshooting

**Precision errors?**
- Check that you're using the correct decimal amounts
- Verify order size limits with `precisionHandler.getOrderSizeLimits(asset)`
- Ensure atomic amounts are integers

**Asset not found?**
- Check the available assets output
- Verify ticker names match exactly
- Ensure trading pairs exist for the assets

**Order size validation fails?**
- Check min/max order limits for the asset
- Try a different amount within the valid range
- Consider the precision when calculating limits