# Kaleidoswap SDK — TypeScript / JavaScript

[![npm package](https://img.shields.io/npm/v/kaleido-sdk?label=npm%20package)](https://www.npmjs.com/package/kaleido-sdk)

TypeScript SDK for trading RGB assets on the Lightning Network via the Kaleidoswap protocol.

## Installation

```bash
npm install kaleido-sdk
# or: pnpm add kaleido-sdk
```

## Quick Start

The SDK exposes two sub-clients depending on what you need:

| Sub-client | Config key | What it does |
|---|---|---|
| `client.maker` | `baseUrl` | Kaleidoswap market API — assets, quotes, swap orders, LSP |
| `client.rln` | `nodeUrl` | Your RGB Lightning Node — wallet, channels, payments, RGB assets |

```typescript
import { KaleidoClient } from 'kaleido-sdk';

// Zero-config — defaults to regtest
const client = await KaleidoClient.create();
const assets = await client.maker.listAssets();

// Maker API only
const client = await KaleidoClient.create({
  baseUrl: 'https://api.signet.kaleidoswap.com',
});
const assets = await client.maker.listAssets();

// Node only (baseUrl still defaults to regtest)
const client = await KaleidoClient.create({
  nodeUrl: 'http://localhost:3001',
});
const info = await client.rln.getNodeInfo();

// Both together
const client = await KaleidoClient.create({
  baseUrl: 'https://api.signet.kaleidoswap.com',
  nodeUrl: 'http://localhost:3001',
});
const pairs    = await client.maker.listPairs();
const channels = await client.rln.listChannels();
```

## Attribution and local development

When `apiKey` is configured, the SDK sends Maker attribution headers over HTTPS only.
HTTP is allowed automatically for local development hosts such as `localhost` and
`127.0.0.1`. To use a non-local HTTP Maker URL intentionally, pass
`allowInsecure: true`.

```typescript
const client = await KaleidoClient.create({
  baseUrl: 'http://dev-maker.internal:8000',
  apiKey: 'kld_live_c_...',
  allowInsecure: true,
});
```

In browsers, generated install IDs are memory-only by default. If your app has
collected the right consent and wants stable browser attribution across sessions,
opt in explicitly:

```typescript
const client = await KaleidoClient.create({
  baseUrl: 'https://api.kaleidoswap.com',
  apiKey: 'kld_live_c_...',
  persistInstallId: true,
});
```

## Documentation

Full usage guide, API reference, and examples at **https://docs.kaleidoswap.com/sdk/introduction**

## License

MIT
