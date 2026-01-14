# TypeScript SDK Examples

This directory contains example scripts demonstrating the Kaleidoswap TypeScript SDK.

## Prerequisites

Build the SDK:
```bash
cd kaleido-sdk/bindings/typescript
npm install
npx napi build --release
npm run build
```

## Examples

### Market Data (`market-data.ts`)
Basic market data operations:
- List available assets and trading pairs
- Get quotes
```bash
npx ts-node examples/market-data.ts
```

### Advanced Market Data (`advanced-market-data.ts`)
Advanced features:
- Asset/pair lookup by ticker
- Amount conversion (display ↔ atomic units)
- Amount validation
- Cache management
```bash
npx ts-node examples/advanced-market-data.ts
```

### Atomic Swap (`atomic-swap.ts`)
Complete swap flow demo:
- Connect to API and node
- Fetch pairs and quotes
- Show order history and LSP info
```bash
export KALEIDO_NODE_URL="http://localhost:3001"
npx ts-node examples/atomic-swap.ts
```

### Error Handling (`error-handling.ts`)
Best practices for error handling:
- Exception handling patterns
- Input validation
- Retry strategies with exponential backoff
- Graceful degradation
```bash
npx ts-node examples/error-handling.ts
```

### WebSocket Quotes (`websocket-quotes.ts`)
Real-time streaming:
- Create quote streams
- Receive live updates
- HTTP fallback
```bash
npx ts-node examples/websocket-quotes.ts
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `KALEIDO_API_URL` | API endpoint | `https://api.regtest.kaleidoswap.com` |
| `KALEIDO_NODE_URL` | RGB-LN node URL | None |

