# kaleidoswap-sdk

WebAssembly bindings for the Kaleidoswap SDK, optimized for web browsers.

## Features

- 🌐 **Pure Browser Support** - Runs directly in the browser, no Node.js required
- ⚡ **WebAssembly Performance** - Near-native speed with WASM
- 🔒 **Type-Safe** - Full TypeScript support with generated type definitions
- 📦 **Small Bundle Size** - Optimized WASM output with minimal overhead
- 🎯 **Modern APIs** - Promise-based async operations
- 🔄 **Cross-Platform HTTP** - Uses browser's native fetch API

## Installation

```bash
npm install kaleidoswap-sdk
# or
yarn add kaleidoswap-sdk
# or
pnpm add kaleidoswap-sdk
```

## Usage

### Basic Example

```typescript
import init, { KaleidoClient, KaleidoConfig } from 'kaleidoswap-sdk';

// Initialize the WASM module (required once)
await init();

// Create a client configuration
const config = KaleidoConfig.withDefaults('https://api.kaleidoswap.com');

// Create the client
const client = new KaleidoClient(config);

// List available assets
const assets = await client.listAssets();
console.log('Available assets:', assets);

// Get a quote
const quote = await client.getQuoteByPair(
  'BTC/USDT',
  100000, // from_amount
  null, // to_amount
  'Lightning', // from_layer
  'Lightning', // to_layer
);
console.log('Quote:', quote);
```

### With Module Bundlers (Webpack, Vite, etc.)

```typescript
// main.ts
import init, { KaleidoClient, KaleidoConfig } from 'kaleidoswap-sdk';

async function main() {
  // Initialize WASM
  await init();

  // Create client
  const config = new KaleidoConfig(
    'https://api.kaleidoswap.com', // base_url
    null, // node_url
    null, // api_key
    30.0, // timeout
    3, // max_retries
    60, // cache_ttl
  );

  const client = new KaleidoClient(config);

  // Use the client
  const assets = await client.listActiveAssets();
  assets.forEach((asset) => {
    console.log(`${asset.ticker}: ${asset.name}`);
  });
}

main().catch(console.error);
```

### Direct Browser Usage (No Bundler)

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Kaleidoswap SDK Example</title>
  </head>
  <body>
    <h1>Kaleidoswap SDK Web</h1>
    <div id="assets"></div>

    <script type="module">
      import init, { KaleidoClient, KaleidoConfig } from './pkg/kaleidoswap_web.js';

      async function main() {
        // Initialize WASM
        await init();

        // Create client
        const config = KaleidoConfig.withDefaults('https://api.kaleidoswap.com');
        const client = new KaleidoClient(config);

        // Fetch and display assets
        const assets = await client.listActiveAssets();

        const assetsDiv = document.getElementById('assets');
        assetsDiv.innerHTML =
          '<ul>' + assets.map((a) => `<li>${a.ticker}: ${a.name}</li>`).join('') + '</ul>';
      }

      main().catch(console.error);
    </script>
  </body>
</html>
```

## API Reference

### Configuration

#### `KaleidoConfig`

Configuration object for the Kaleidoswap client.

```typescript
// Create with defaults
const config = KaleidoConfig.withDefaults('https://api.kaleidoswap.com');

// Or create with custom settings
const config = new KaleidoConfig(
  'https://api.kaleidoswap.com', // base_url
  'http://localhost:3001', // node_url (optional)
  'your-api-key', // api_key (optional)
  30.0, // timeout in seconds
  3, // max_retries
  60, // cache_ttl in seconds
);

// Update configuration
config.setNodeUrl('http://localhost:3001');
config.setApiKey('your-api-key');
```

### Client Methods

#### Market Data

```typescript
// List all assets
const assets = await client.listAssets();

// List active assets only
const activeAssets = await client.listActiveAssets();

// Get asset by ticker
const btc = await client.getAssetByTicker('BTC');

// List all trading pairs
const pairs = await client.listPairs();

// List active pairs only
const activePairs = await client.listActivePairs();

// Get pair by ticker
const pair = await client.getPairByTicker('BTC/USDT');
```

#### Quotes

```typescript
// Get quote by pair ticker
const quote = await client.getQuoteByPair(
  'BTC/USDT', // ticker
  100000, // from_amount (satoshis)
  null, // to_amount
  'Lightning', // from_layer
  'Lightning', // to_layer
);

// Get quote by asset tickers
const quote = await client.getQuoteByAssets(
  'BTC', // from_ticker
  'USDT', // to_ticker
  100000, // from_amount
  null, // to_amount
  'Lightning', // from_layer
  'Lightning', // to_layer
);
```

#### Node Operations

```typescript
// Get node information (requires node_url)
const nodeInfo = await client.getNodeInfo();

// Get swap status
const status = await client.getSwapStatus('payment_hash_here');
```

### Utility Functions

```typescript
import { toSmallestUnits, toDisplayUnits } from 'kaleidoswap-sdk';

// Convert to smallest units (e.g., BTC to satoshis)
const satoshis = toSmallestUnits(1.0, 8); // 100000000

// Convert to display units (e.g., satoshis to BTC)
const btc = toDisplayUnits(100000000, 8); // 1.0
```

## Build from Source

```bash
# Install wasm-pack
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# Build for bundlers (Webpack, Vite, etc.)
npm run build

# Build for direct web use
npm run build:web

# Build for Node.js
npm run build:nodejs

# Build all targets
npm run build:all

# Run tests
npm test
```

## Browser Compatibility

- Chrome/Edge 87+
- Firefox 78+
- Safari 14+
- Any browser with WebAssembly support

## Bundle Size

- WASM module: ~150KB (gzipped)
- JavaScript glue: ~20KB (gzipped)

## Differences from Node.js SDK

The web SDK has some differences from `@kaleidoswap/sdk` (Node.js version):

1. **Initialization Required**: Must call `await init()` before using
2. **No Node Operations**: Some Node.js-specific features are not available in browsers
3. **Native Fetch**: Uses browser's fetch API instead of Node.js HTTP
4. **WebSocket**: Uses browser's WebSocket API

## TypeScript Support

The package includes TypeScript definitions generated automatically by wasm-bindgen.

```typescript
import type { Asset, TradingPair, Quote } from 'kaleidoswap-sdk';
```

## Examples

See the `examples/` directory for more examples:

- Basic usage
- React integration
- Vue integration
- Error handling

## License

MIT

## Support

- Documentation: https://docs.kaleidoswap.com
- Issues: https://github.com/kaleidoswap/kaleido-sdk/issues
- Discord: https://discord.gg/kaleidoswap
