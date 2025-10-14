# Hybrid Swap Examples

Hybrid swaps combine onchain and Lightning Network settlements. These examples require an RLN (RGB Lightning Node).

## Coming Soon

The following hybrid swap examples will be added in the next update:

### 1. Onchain to Lightning (`buy-btc-with-ln.ts`)
- Pay with RGB20 onchain
- Receive BTC via Lightning invoice
- **Use case**: Fast BTC receipts

### 2. Lightning to Onchain (`sell-btc-via-ln.ts`)
- Pay with BTC via Lightning
- Receive RGB20 onchain
- **Use case**: Convert Lightning BTC to stable assets

## Current Alternatives

Until these examples are available, you can:

1. **Use onchain-to-onchain swaps** (no RLN node required):
   - `examples/onchain/buy-btc-onchain.ts`
   - `examples/onchain/sell-btc-onchain.ts`

2. **Use Lightning-to-Lightning atomic swaps** (fastest):
   - `examples/atomic/atomic-swap-ln-to-ln.ts`

## Implementation Notes

Hybrid swaps require:
- RLN node configuration
- Lightning channel liquidity
- Invoice generation capabilities
- Onchain RGB wallet integration

Check back soon for complete implementations!
