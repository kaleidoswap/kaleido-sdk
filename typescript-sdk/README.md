# Kaleidoswap SDK — TypeScript / JavaScript

[![npm package](https://img.shields.io/npm/v/kaleidoswap-sdk?label=npm%20package)](https://www.npmjs.com/package/kaleidoswap-sdk)

TypeScript SDK for trading RGB assets on the Lightning Network via the Kaleidoswap protocol.

## Installation

```bash
npm install kaleidoswap-sdk
# or: pnpm add kaleidoswap-sdk
```

## Quick Start

The SDK exposes two sub-clients depending on what you need:

| Sub-client | Config key | What it does |
|---|---|---|
| `client.maker` | `baseUrl` | Kaleidoswap market API — assets, quotes, swap orders, LSP |
| `client.rln` | `nodeUrl` | Your RGB Lightning Node — wallet, channels, payments, RGB assets |

```typescript
import { KaleidoClient } from 'kaleidoswap-sdk';

// Zero-config — defaults to regtest
const client = KaleidoClient.create();
const assets = await client.maker.listAssets();

// Maker API only
const client = KaleidoClient.create({
  baseUrl: 'https://api.kaleidoswap.com',
});
const assets = await client.maker.listAssets();

// Node only (baseUrl still defaults to regtest)
const client = KaleidoClient.create({
  nodeUrl: 'http://localhost:3001',
});
const info = await client.rln.getNodeInfo();

// Both together
const client = KaleidoClient.create({
  baseUrl: 'https://api.kaleidoswap.com',
  nodeUrl: 'http://localhost:3001',
});
const pairs    = await client.maker.listPairs();
const channels = await client.rln.listChannels();
```

## Documentation

Full usage guide, API reference, and examples at **https://docs.kaleidoswap.com/sdk/introduction**

## License

MIT
