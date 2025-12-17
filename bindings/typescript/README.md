# Kaleidoswap TypeScript/Node.js SDK

TypeScript bindings for the Kaleidoswap SDK - trade RGB assets on Bitcoin Lightning Network.

## Installation

```bash
npm install @kaleidoswap/sdk
# or
yarn add @kaleidoswap/sdk
```

## Quick Start

```typescript
import { createClient } from '@kaleidoswap/sdk';

// Create a client
const client = createClient({
  baseUrl: 'https://api.regtest.kaleidoswap.com',
  timeout: 30.0,
  maxRetries: 3,
  cacheTtl: 60,
});

// List available assets
const assets = await client.listAssets();
console.log(JSON.parse(assets));

// List trading pairs
const pairs = await client.listPairs();
console.log(JSON.parse(pairs));

// Get a quote
const quote = await client.getQuoteByPair('BTC/USDT', 100000);
console.log(JSON.parse(quote));
```

## Configuration

```typescript
interface KaleidoConfig {
  baseUrl: string;       // Kaleidoswap API URL
  nodeUrl?: string;      // Optional RGB Lightning Node URL
  timeout?: number;      // Request timeout in seconds (default: 30)
  maxRetries?: number;   // Max retry attempts (default: 3)
  cacheTtl?: number;     // Cache TTL in seconds (default: 60)
}
```

## Development

### Building from Source

Requires Rust and Node.js:

```bash
# Install dependencies
npm install

# Build native module and TypeScript
npm run build
```

### Running Tests

```bash
npm test
```

## License

MIT License - see [LICENSE](../../LICENSE) for details.
