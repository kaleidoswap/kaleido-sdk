# TypeScript SDK Examples

This directory contains example scripts demonstrating the Kaleidoswap TypeScript SDK.

## Prerequisites

Build the SDK:
```bash
cd kaleido-sdk/bindings/typescript
npm install
npx napi build --release
cp index.node kaleidoswap.node
npm run build
```

## Examples

### Market Data (`market-data.ts`)

Demonstrates fetching market data:
- List available assets
- List trading pairs  
- Get quotes

```bash
npx ts-node examples/market-data.ts
```

### Atomic Swap (`atomic-swap.ts`)

Demonstrates the complete swap flow:
- Connect to API and node
- Fetch pairs and quotes
- Show order history
- Display LSP info

```bash
# Set environment variables for node connection
export KALEIDO_NODE_URL="http://localhost:3001"

npx ts-node examples/atomic-swap.ts
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `KALEIDO_API_URL` | API endpoint | `https://api.regtest.kaleidoswap.com` |
| `KALEIDO_NODE_URL` | RGB-LN node URL | None |
