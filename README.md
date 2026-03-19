# Kaleidoswap SDK

Official multi-language SDK for interacting with [Kaleidoswap](https://kaleidoswap.com), a decentralized exchange for Bitcoin and RGB assets on the Lightning Network.

## SDKs

| Language | Status | Package | README |
|----------|--------|---------|--------|
| **Python** | ✅ Ready | `kaleidoswap-sdk` v0.5.6 | [python-sdk/README.md](./python-sdk/README.md) |
| **TypeScript** | ✅ Ready | `kaleidoswap-sdk` v0.5.6 | [typescript-sdk/README.md](./typescript-sdk/README.md) |

## How It Works

```text
specs/kaleidoswap.json
specs/rgb-lightning-node.yaml
          |
          +--> scripts/generate_python_sdk_models.sh --> python-sdk/kaleido_sdk/_generated/
          |
          +--> scripts/generate_typescript_types.sh  --> typescript-sdk/src/generated/
```

Each SDK is implemented natively in its language and consumes generated types/models from the same OpenAPI source of truth. Never edit the generated files directly — regenerate them from the specs instead.

## Two independent clients

The SDK is split into two sub-clients that can be used **independently or together**:

| Sub-client | Config key | What it covers | Requires |
|---|---|---|---|
| `client.maker` | `baseUrl` | KaleidoSwap market API — assets, quotes, swap orders, atomic swaps, LSP | Public API URL |
| `client.rln` | `nodeUrl` | Your RGB Lightning Node — wallet, channels, payments, RGB assets | Running RLN daemon |

You do **not** need an RLN node to query the KaleidoSwap market or place swap orders. Likewise, you can drive your RLN node without pointing to the KaleidoSwap API.

## Features

### KaleidoSwap Maker API (`client.maker`)
- **Typed models** generated from OpenAPI specs — always in sync with the API
- **Market operations** — list assets, trading pairs, request quotes
- **Swap orders** — create orders, poll status, full order lifecycle
- **Atomic swaps** — init / execute / status for trustless Lightning swaps
- **LSP (Lightning Service Provider)** — channel fee estimation and ordering (LSPS1)
- **WebSocket streaming** — real-time quote streaming with auto-reconnect and per-route filtering
- **Precision utilities** — raw ↔ display amount conversion, order-size validation
- **Asset pair mapper** — ticker-based asset and pair lookup helpers

### RGB Lightning Node (`client.rln`)
- **Node control** — wallet info, on-chain address, BTC balance
- **Channel management** — list, open, and close Lightning channels
- **RGB asset operations** — list and send RGB assets
- **Payments** — create and pay Lightning invoices

### Shared
- **Typed error hierarchy** — distinct error classes with `.isRetryable()` hints
- **Pluggable logging** — silent by default; opt in via `logLevel` or bring your own logger

## Environments

| Environment | Base URL |
|-------------|----------|
| Regtest (default) | `https://api.regtest.kaleidoswap.com` |
| Signet | `https://api.signet.kaleidoswap.com` |

## Installation

### Python

```bash
pip install kaleidoswap-sdk
```

### TypeScript / Node.js

```bash
pnpm add kaleidoswap-sdk
# or: npm install kaleidoswap-sdk
```

## Quick Start

### KaleidoSwap API only — no node required

<table>
<tr><th>Python</th><th>TypeScript</th></tr>
<tr><td>

```python
import asyncio
from kaleido_sdk import KaleidoClient

async def main() -> None:
    # No node needed — market API only
    client = KaleidoClient.create(
        base_url="https://api.signet.kaleidoswap.com"
    )
    async with client:
        assets = await client.maker.list_assets()
        pairs  = await client.maker.list_pairs()
        print(f"{len(assets.assets)} assets, {len(pairs.pairs)} pairs")

asyncio.run(main())
```

</td><td>

```typescript
import { KaleidoClient } from 'kaleidoswap-sdk';

// No node needed — market API only
const client = KaleidoClient.create({
  baseUrl: 'https://api.signet.kaleidoswap.com',
});

const assets = await client.maker.listAssets();
const pairs  = await client.maker.listPairs();
console.log(`${assets.assets.length} assets, ${pairs.pairs.length} pairs`);
```

</td></tr>
</table>

### RLN node only — no KaleidoSwap API needed

<table>
<tr><th>Python</th><th>TypeScript</th></tr>
<tr><td>

```python
# No baseUrl needed — drives your node directly
client = KaleidoClient.create(node_url="http://localhost:3001")
async with client:
    info     = await client.rln.get_node_info()
    balance  = await client.rln.get_btc_balance()
    channels = await client.rln.list_channels()
```

</td><td>

```typescript
// No baseUrl needed — drives your node directly
const client = KaleidoClient.create({
  nodeUrl: 'http://localhost:3001',
});

const info     = await client.rln.getNodeInfo();
const balance  = await client.rln.getBalance();
const channels = await client.rln.listChannels();
```

</td></tr>
</table>

### Both together — full swap flow

<table>
<tr><th>Python</th><th>TypeScript</th></tr>
<tr><td>

```python
client = KaleidoClient.create(
    base_url="https://api.signet.kaleidoswap.com",
    node_url="http://localhost:3001",
)
async with client:
    pairs    = await client.maker.list_pairs()
    channels = await client.rln.list_channels()
```

</td><td>

```typescript
const client = KaleidoClient.create({
  baseUrl: 'https://api.signet.kaleidoswap.com',
  nodeUrl: 'http://localhost:3001',
});

const pairs    = await client.maker.listPairs();
const channels = await client.rln.listChannels();
```

</td></tr>
</table>

See [python-sdk/README.md](./python-sdk/README.md) and [typescript-sdk/README.md](./typescript-sdk/README.md) for full usage guides.

## API Coverage

### `client.maker` — KaleidoSwap API

| Group | Key methods | Description |
|-------|-------------|-------------|
| Market | `listAssets`, `listPairs`, `getQuote`, `getPairRoutes`, `getMarketRoutes` | Assets, pairs, and price quotes |
| Swap Orders | `createSwapOrder`, `getSwapOrderStatus`, `getOrderHistory`, `getOrderAnalytics`, `submitRateDecision`, `waitForSwapCompletion` | Order lifecycle management |
| Atomic Swaps | `initSwap`, `executeSwap`, `getAtomicSwapStatus`, `getSwapNodeInfo` | Trustless atomic swap operations |
| LSPS1 | `getLspInfo`, `getLspNetworkInfo`, `estimateLspFees`, `createLspOrder`, `getLspOrder`, `submitLspRateDecision`, `retryAssetDelivery` | Lightning channel service |
| WebSocket | `enableWebSocket`, `streamQuotes`, `streamQuotesByTicker`, `streamQuotesForAllRoutes` | Real-time quote streaming |

### `client.rln` — RGB Lightning Node

| Group | Key methods | Description |
|-------|-------------|-------------|
| Node | `getNodeInfo`, `getAddress`, `getBalance` | Node info and on-chain wallet |
| Channels | `listChannels`, `openChannel`, `closeChannel` | Lightning channel management |
| Assets | `listAssets`, `sendAsset` | RGB asset operations |
| Payments | `createLNInvoice`, `sendPayment` | Lightning payments |

## Development

### Prerequisites

- Python 3.10+
- Node.js 18+
- pnpm
- uv

### Build

```bash
# Build both SDKs
make build

# Build individually
make build-python-sdk
make build-typescript
```

### Test

```bash
# Run all tests
make test

# Run per SDK
make test-python-sdk
make test-typescript
```

### Regenerate Models

```bash
# Regenerate both SDK model/type outputs
make generate-models

# Regenerate individually
make generate-python-sdk-models
make generate-ts-types

# Full refresh (download latest specs + regenerate)
make regenerate
```

## Roadmap

- [x] Python SDK
- [x] TypeScript SDK
- [x] OpenAPI-driven model generation
- [x] WebSocket support
- [ ] Swift SDK for iOS/macOS
- [ ] Kotlin SDK for Android
- [ ] CLI tool

## Contributing

We welcome contributions. See [CONTRIBUTING.md](./CONTRIBUTING.md).

Key points:
- Never edit generated model files directly — regenerate from OpenAPI specs.
- Include tests for behavior changes.
- Run format/lint checks before pushing.

## License

MIT License. See [LICENSE](./LICENSE).

## Resources

- Specs: [specs/kaleidoswap.json](./specs/kaleidoswap.json), [specs/rgb-lightning-node.yaml](./specs/rgb-lightning-node.yaml)
- RGB Lightning Node: [RGB-Tools/rgb-lightning-node](https://github.com/RGB-Tools/rgb-lightning-node)
- Website: [kaleidoswap.com](https://kaleidoswap.com)
- Docs: [docs.kaleidoswap.com](https://docs.kaleidoswap.com)
