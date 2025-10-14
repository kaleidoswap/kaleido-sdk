# KaleidoSwap SDK - Complete Examples Guide

This guide provides comprehensive examples for all swap scenarios supported by KaleidoSwap.

## Swap Scenarios Overview

KaleidoSwap supports swaps between Bitcoin (BTC) and RGB20 assets (like USDT, XAUT) using different settlement methods:

| Scenario | From → To | RLN Node Required | Use Case |
|----------|-----------|-------------------|----------|
| **Onchain to Onchain** | BTC/RGB20 → BTC/RGB20 | ❌ No | Most common, no Lightning setup needed |
| **Onchain to Lightning** | BTC/RGB20 → LN Invoice | ✅ Yes | Fast settlement, receive via Lightning |
| **Lightning to Onchain** | LN Payment → BTC/RGB20 | ✅ Yes | Pay with Lightning, receive onchain |
| **Lightning to Lightning** | LN Payment → LN Invoice | ✅ Yes | Fastest, atomic swap via Lightning |

## Prerequisites

### Basic Setup (All Examples)
```bash
npm install @kaleidoswap/kaleidoswap-sdk
```

### For Lightning Examples (RLN Node Required)
You need a running RGB Lightning Node (RLN). Set up your node URL:

```typescript
const client = new KaleidoClient({
  baseUrl: 'https://api.staging.kaleidoswap.com/api/v1',
  nodeUrl: 'http://localhost:3001'  // Your RLN node
});
```

## Quick Start Matrix

### Without RLN Node (Onchain Only)

#### 1. Buy BTC with RGB20 (Onchain → Onchain)
```bash
npm run example:buy-btc-onchain
# or
ts-node examples/onchain/buy-btc-onchain.ts
```
**Scenario**: You have USDT onchain and want to receive BTC onchain.

#### 2. Sell BTC for RGB20 (Onchain → Onchain)
```bash
npm run example:sell-btc-onchain
# or
ts-node examples/onchain/sell-btc-onchain.ts
```
**Scenario**: You have BTC onchain and want to receive USDT onchain.

### With RLN Node (Lightning Support)

#### 3. Buy BTC with Lightning (Onchain → Lightning)
```bash
npm run example:buy-btc-lightning
# or
ts-node examples/hybrid/buy-btc-with-ln.ts
```
**Scenario**: You have USDT onchain, want to receive BTC via Lightning invoice.

#### 4. Sell BTC via Lightning (Lightning → Onchain)
```bash
npm run example:sell-btc-via-ln
# or
ts-node examples/hybrid/sell-btc-via-ln.ts
```
**Scenario**: You pay with Lightning, receive USDT onchain.

#### 5. Atomic Swap Lightning to Lightning
```bash
npm run example:atomic-swap-ln
# or
ts-node examples/atomic/atomic-swap-ln-to-ln.ts
```
**Scenario**: Fastest swap - pay with Lightning, receive via Lightning invoice. Uses atomic swap protocol.

## Detailed Examples

### Onchain to Onchain Swaps

These examples work **without** an RLN node. Perfect for getting started.

#### Example 1: Buy BTC (Trade USDT for BTC)
- **File**: `examples/onchain/buy-btc-onchain.ts`
- **From**: USDT (Onchain)
- **To**: BTC (Onchain)
- **Node**: Not required
- **Flow**:
  1. Get quote for USDT → BTC
  2. Create swap order
  3. Send USDT to provided address
  4. Receive BTC onchain

#### Example 2: Sell BTC (Trade BTC for USDT)
- **File**: `examples/onchain/sell-btc-onchain.ts`
- **From**: BTC (Onchain)
- **To**: USDT (Onchain)
- **Node**: Not required
- **Flow**:
  1. Get quote for BTC → USDT
  2. Create swap order
  3. Send BTC to provided address
  4. Receive USDT onchain

### Hybrid Swaps (Onchain ↔ Lightning)

These examples **require** an RLN node running.

#### Example 3: Buy BTC with Onchain, Receive via Lightning
- **File**: `examples/hybrid/buy-btc-with-ln.ts`
- **From**: USDT (Onchain)
- **To**: BTC (Lightning Invoice)
- **Node**: Required
- **Benefits**: Fast settlement, immediate Lightning balance
- **Flow**:
  1. Generate Lightning invoice for BTC
  2. Get quote for USDT → BTC
  3. Create swap order with Lightning settlement
  4. Send USDT onchain
  5. Receive BTC via Lightning invoice

#### Example 4: Sell BTC via Lightning
- **File**: `examples/hybrid/sell-btc-via-ln.ts`
- **From**: BTC (Lightning Payment)
- **To**: USDT (Onchain)
- **Node**: Required
- **Benefits**: Instant payment, receive stable asset onchain
- **Flow**:
  1. Get quote for BTC → USDT
  2. Create swap order with Lightning payment
  3. Pay Lightning invoice
  4. Receive USDT onchain

### Atomic Swaps (Lightning to Lightning)

These examples use the **atomic swap protocol** for fastest execution.

#### Example 5: Lightning to Lightning Atomic Swap
- **File**: `examples/atomic/atomic-swap-ln-to-ln.ts`
- **From**: BTC (Lightning Payment)
- **To**: USDT (Lightning Invoice)
- **Node**: Required (both sides)
- **Benefits**: Fastest possible swap, atomic execution
- **Flow**:
  1. Initialize maker swap (get swapstring)
  2. Whitelist the trade on taker node
  3. Execute atomic swap
  4. Monitor swap completion

## Running the Examples

### Method 1: Using npm scripts (Recommended)
```bash
# Onchain examples (no node required)
npm run example:buy-btc-onchain
npm run example:sell-btc-onchain

# Hybrid examples (node required)
npm run example:buy-btc-lightning
npm run example:sell-btc-via-ln

# Atomic swap (node required)
npm run example:atomic-swap-ln
```

### Method 2: Direct execution with ts-node
```bash
# Install dependencies first
npm install

# Run specific example
ts-node examples/onchain/buy-btc-onchain.ts
ts-node examples/atomic/atomic-swap-ln-to-ln.ts
```

### Method 3: Build and run JavaScript
```bash
# Build the SDK
npm run build

# Run compiled examples
node dist/examples/onchain/buy-btc-onchain.js
```

## Configuration

### Basic Configuration (Onchain Only)
```typescript
import { KaleidoClient } from '@kaleidoswap/kaleidoswap-sdk';

const client = new KaleidoClient({
  baseUrl: 'https://api.staging.kaleidoswap.com/api/v1'
});
```

### Full Configuration (With Lightning)
```typescript
import { KaleidoClient } from '@kaleidoswap/kaleidoswap-sdk';

const client = new KaleidoClient({
  baseUrl: 'https://api.staging.kaleidoswap.com/api/v1',
  nodeUrl: 'http://localhost:3001',  // Your RLN node
  timeout: 30000,
  retries: 3
});
```

### Environment Variables
```bash
# Optional: Set default API URL
export KALEIDO_API_URL=https://api.staging.kaleidoswap.com/api/v1

# Optional: Set node URL
export KALEIDO_NODE_URL=http://localhost:3001
```

## Common Patterns

### 1. Getting a Quote
```typescript
// For exact input (you know how much you're sending)
const quote = await client.quoteRequest(
  fromAsset,
  toAsset,
  fromAmount  // in atomic units
);

// For exact output (you know how much you want to receive)
const quote = await client.quoteRequest(
  fromAsset,
  toAsset,
  undefined,
  toAmount  // in atomic units
);
```

### 2. Amount Conversion (Decimal ↔ Atomic)
```typescript
import { createPrecisionHandler } from '@kaleidoswap/kaleidoswap-sdk';

const precisionHandler = createPrecisionHandler(assets);

// Convert 100 USDT to atomic units
const atomicAmount = precisionHandler.toAssetAmount(100, usdtAsset.asset_id);

// Convert atomic units back to decimal
const decimal = precisionHandler.toAssetDecimalAmount(100000000, btcAsset.asset_id);
```

### 3. Monitoring Swap Status
```typescript
// Poll for order status
const maxAttempts = 60;
for (let i = 0; i < maxAttempts; i++) {
  await new Promise(resolve => setTimeout(resolve, 5000));

  const status = await client.swapOrderStatus(orderId);
  console.log(`Status: ${status.status}`);

  if (status.status === 'COMPLETED') {
    console.log('Swap completed!');
    break;
  } else if (status.status === 'FAILED') {
    throw new Error('Swap failed');
  }
}
```

### 4. Atomic Swap Flow
```typescript
// 1. Initialize swap (maker side)
const initResult = await client.initMakerSwap({
  rfq_id: quote.rfq_id,
  from_asset: quote.from_asset,
  to_asset: quote.to_asset,
  from_amount: quote.from_amount,
  to_amount: quote.to_amount
});

// 2. Whitelist trade (taker side - requires node)
await client.whitelistTrade(initResult.swapstring);

// 3. Execute swap (taker side)
const takerPubkey = await client.getNodePubkey();
const result = await client.executeMakerSwap({
  swapstring: initResult.swapstring,
  payment_hash: initResult.payment_hash,
  taker_pubkey: takerPubkey
});

// 4. Monitor completion
const swapStatus = await client.waitForSwapCompletion(
  initResult.payment_hash,
  300,  // timeout in seconds
  5     // poll interval in seconds
);
```

## Error Handling

### Basic Error Handling
```typescript
try {
  const quote = await client.quoteRequest(fromAsset, toAsset, amount);
} catch (error) {
  if (error instanceof Error) {
    console.error('Error:', error.message);

    // Handle specific errors
    if (error.message.includes('insufficient liquidity')) {
      console.log('Not enough liquidity for this trade');
    } else if (error.message.includes('Node URL is required')) {
      console.log('This operation requires an RLN node');
    }
  }
}
```

### Retry with Exponential Backoff
```typescript
import { retry } from '@kaleidoswap/kaleidoswap-sdk';

const quote = await retry(
  async () => client.quoteRequest(fromAsset, toAsset, amount),
  {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000
  }
);
```

## Troubleshooting

### "Node URL is required"
- **Cause**: Trying to use Lightning features without configuring nodeUrl
- **Solution**: Add `nodeUrl` to your KaleidoClient configuration
- **Alternative**: Use onchain-to-onchain examples instead

### "Insufficient liquidity"
- **Cause**: Not enough liquidity in the pool for your trade size
- **Solution**: Try a smaller amount or different asset pair

### "Asset not found"
- **Cause**: Incorrect asset ticker or asset ID
- **Solution**: Use `client.assetList()` to see available assets

### "Order size validation failed"
- **Cause**: Amount too small or too large
- **Solution**: Check min/max order sizes with `precisionHandler.getOrderSizeLimits(asset)`

### "Swap timeout"
- **Cause**: Swap took too long to complete
- **Solution**: Check order status manually with `client.swapOrderStatus(orderId)`

## Testing

Run the test suite to verify everything works:

```bash
# Run all tests
npm test

# Run specific test file
npm test -- client.test.ts

# Run with coverage
npm run test:coverage

# Watch mode during development
npm run test:watch
```

## Next Steps

1. **Start Simple**: Try onchain-to-onchain examples first (no node required)
2. **Set Up RLN Node**: Follow [RLN setup guide](https://docs.kaleidoswap.com/rln-setup) for Lightning examples
3. **Build Your App**: Use these examples as templates for your trading application
4. **Read API Docs**: Check [API documentation](../docs/index.md) for complete reference

## Support

- 📚 [Full Documentation](../docs/index.md)
- 🐛 [Report Issues](https://github.com/kaleidoswap/kaleido-sdk/issues)
- 💬 [Community Discord](https://discord.gg/kaleidoswap)
- 📧 [Email Support](mailto:support@kaleidoswap.com)
