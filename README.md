# Kaleidoswap SDK

Official multi-language SDK for interacting with [Kaleidoswap](https://kaleidoswap.com) - a decentralized exchange for Bitcoin and RGB assets on the Lightning Network.

## 🌐 Unified Architecture

The SDK is built in **Rust** with bindings for multiple languages:

| Language | Status | Package |
|----------|--------|---------|
| **Rust** | ✅ Ready | `kaleidoswap-core` |
| **Python** | ✅ Ready | `kaleidoswap` |
| **TypeScript** | ✅ Ready | `@kaleidoswap/sdk` |
| **Swift** | 🚧 Planned | - |

## ✨ Features

- 📊 **Market Data** - Assets, trading pairs, and real-time quotes
- 🔄 **Swap Operations** - Atomic swaps on Lightning and on-chain
- 📦 **Swap Orders** - Order management and history
- ⚡ **LSPS1 Channels** - Lightning channel creation via LSP
- 🔗 **RGB Lightning Node** - Full RGB node integration
- 🛡️ **Type Safe** - Auto-generated models from OpenAPI specs
- 🔧 **Built-in Retry** - Exponential backoff for reliability
- 📡 **WebSocket** - Real-time updates (coming soon)

## Installation

### Rust

Add to your `Cargo.toml`:

```toml
[dependencies]
kaleidoswap-core = "0.2"
```

### Python

```bash
pip install kaleidoswap
```

### TypeScript/Node.js

```bash
pnpm add @kaleidoswap/sdk
```

## Quick Start

### Rust

```rust
use kaleidoswap_core::{KaleidoClient, KaleidoConfig};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = KaleidoConfig::new("https://api.regtest.kaleidoswap.com");
    let client = KaleidoClient::new(config)?;

    // Get available assets
    let assets = client.list_assets().await?;
    println!("Found {} assets", assets.len());

    // Get a quote (amounts are i64)
    let quote = client.get_best_quote(
        "BTC/USDT", 
        Some(1000000), // 0.01 BTC
        None
    ).await?;
    
    println!("Quote: {} -> {}", 
        quote.from_asset.amount, 
        quote.to_asset.amount
    );

    Ok(())
}
```


### Python

```python
from kaleidoswap import KaleidoClient, KaleidoConfig

# Configure client
config = KaleidoConfig(base_url="https://api.regtest.kaleidoswap.com")
client = KaleidoClient(config)

# Market API - Returns typed Pydantic objects
assets = client.market.list_assets()  # List[Asset]
print(f"Found {len(assets)} assets")

for asset in assets:
    print(f"  {asset.ticker}: {asset.name}")

# Get typed quote
quote = client.market.get_best_quote("BTC/USDT", 1_000_000)  # PairQuoteResponse
print(f"Rate: {quote.price}")
print(f"Fee: {quote.fee.amount} {quote.fee.asset_ticker}")

# Order management
history = client.orders.get_order_history()  # OrderHistoryResponse
print(f"Total orders: {history.total}")

# RGB Node operations (if configured)
if client.node:
    node_info = client.node.get_rgb_node_info()  # RgbNodeInfoResponse
    print(f"Node pubkey: {node_info.pubkey}")
    
    channels = client.node.list_channels()  # List[RgbChannel]
    balance = client.node.get_btc_balance()  # BtcBalanceResponse
    print(f"BTC Balance: {balance.vanilla.spendable} sats")
```

**Error Handling:**
```python
from kaleidoswap import QuoteExpiredError, InsufficientBalanceError

try:
    quote = client.market.get_quote_by_pair("BTC/USDT", 1_000_000)
except QuoteExpiredError:
    # Refresh quote
    quote = client.market.get_quote_by_pair("BTC/USDT", 1_000_000)
except InsufficientBalanceError as e:
    print(f"Need {e.required_amount - e.available_amount} more")
```

### TypeScript/Node.js

```typescript
import { KaleidoClient } from '@kaleidoswap/sdk';

const config = {
    baseUrl: 'https://api.regtest.kaleidoswap.com',
};

const client = new KaleidoClient(config);

// Market API - Returns typed objects
const assets = await client.market.listAssets();
console.log(`Found ${assets.length} assets`);

assets.forEach(asset => {
    console.log(`  ${asset.ticker}: ${asset.name}`);
});

// Get typed quote
const quote = await client.market.getBestQuote("BTC/USDT", 1_000_000);
console.log(`Rate: ${quote.price}`);
console.log(`Fee: ${quote.fee.amount} ${quote.fee.assetTicker}`);

// Order management
const history = await client.orders.getOrderHistory();
console.log(`Total orders: ${history.total}`);

// RGB Node operations (if configured)
if (client.node) {
    const nodeInfo = await client.node.getRgbNodeInfo();
    console.log(`Node pubkey: ${nodeInfo.pubkey}`);
    
    const channels = await client.node.listChannels();
    const balance = await client.node.getBtcBalance();
}
```

## 📚 Documentation

- **[Architecture](./docs/ARCHITECTURE.md)** - SDK design and structure
- **[API Reference](./docs/API_REFERENCE.md)** - Complete API documentation
- **[Examples](./docs/EXAMPLES.md)** - Code examples and workflows
- **[Error Handling](./docs/ERROR_HANDLING.md)** - Error types and handling
- **[WebSocket](./docs/WEBSOCKET.md)** - Real-time updates

## 🔧 Development

### Prerequisites

- Rust 1.75+
- Python 3.8+ (for Python bindings)
- Node.js 18+ (for TypeScript bindings)
- Docker (for regenerating models)

### Building

```bash
# Build everything
make build

# Build individual components
make build-rust
make build-python
make build-typescript
```

### Testing

```bash
# Run all tests
make test

# Test specific language
cargo test                    # Rust
make test-python              # Python
make test-typescript          # TypeScript
```

### Regenerating Models

Models are auto-generated from OpenAPI specs using Docker.

**Using Remote Specs (CI/Default):**
```bash
make regenerate
```

**Using Local Spec (Development):**
1. Generate `openapi.json` in `kaleidoswap-maker`.
2. Copy it to `specs/kaleidoswap.json`.
3. Run:
```bash
make generate-models
```

See [Architecture](./docs/ARCHITECTURE.md) for details on the code generation workflow.

## 📖 API Coverage

| API | Description | Status |
|-----|-------------|--------|
| Market | Assets, pairs, quotes | ✅ |
| Swaps | Atomic swap operations | ✅ |
| Swap Orders | Order creation and management | ✅ |
| LSPS1 | Lightning channel service | ✅ |
| RGB Node | Full RGB Lightning Node API | ✅ |

## 🗺️ Roadmap

- [x] Core Rust library
- [x] Python bindings
- [x] TypeScript bindings
- [x] Auto-generated models from OpenAPI
- [ ] WebSocket support for real-time updates
- [ ] Swift bindings for iOS/macOS
- [ ] Kotlin bindings for Android
- [ ] CLI tool

See [ROADMAP.md](./ROADMAP.md) for the complete development timeline.

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

Key points:
- Never edit files in `models/` directly - regenerate from OpenAPI
- All changes should include tests
- Format code with `make format` before committing

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Resources

- **API Specs**: [Kaleidoswap OpenAPI](./specs/kaleidoswap.json)
- **RGB Node**: [rgb-lightning-node](https://github.com/RGB-Tools/rgb-lightning-node)
- **Website**: [kaleidoswap.com](https://kaleidoswap.com)