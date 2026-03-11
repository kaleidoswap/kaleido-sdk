# Kaleidoswap SDK — TypeScript / JavaScript

[![npm version](https://badge.fury.io/js/kaleidoswap-sdk.svg)](https://www.npmjs.com/package/kaleidoswap-sdk)

TypeScript SDK for trading RGB assets on the Lightning Network via the Kaleidoswap protocol.

## Installation

```bash
pnpm add kaleidoswap-sdk
# or: npm install kaleidoswap-sdk
```

## Quick Start

```typescript
import { KaleidoClient } from 'kaleidoswap-sdk';

const client = KaleidoClient.create({
  baseUrl: 'https://api.kaleidoswap.com',
});

const assets = await client.maker.listAssets();
const pairs  = await client.maker.listPairs();
```

## Documentation

Full usage guide, API reference, and examples at **https://docs.kaleidoswap.com/sdk/introduction**

## License

MIT
