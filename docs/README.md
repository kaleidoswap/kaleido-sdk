# Kaleidoswap SDK Documentation

Official multi-language SDK for interacting with the Kaleidoswap protocol. This documentation covers Python, TypeScript, and Rust implementations.

## Table of Contents

- [Getting Started](#getting-started)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Configuration](#configuration)
- [Features by Implementation Status](#features-by-implementation-status)
- [Contributing](#contributing)

## 🚀 New to Kaleidoswap SDK?

**[Start Here: Getting Started Guide →](GETTING_STARTED.md)**

The Getting Started Guide will help you choose the right SDK and get up and running in 5 minutes.

## Getting Started

Kaleidoswap SDK provides a unified interface for interacting with the Kaleidoswap protocol across multiple programming languages. The SDK supports:

- **Market Operations**: Get quotes, list assets and trading pairs
- **Swap Operations**: Initialize and execute maker/taker swaps
- **LSP Operations**: Create orders, manage channels
- **Real-time Data**: WebSocket streams for live price updates
- **Node Management**: Connect peers, manage assets

## Installation

### Python SDK

```bash
pip install kaleidoswap-sdk
# Or with uv: uv add kaleidoswap-sdk
```

**Requirements**: Python 3.11+

### TypeScript SDK

```bash
# Install via npm
npm install @kaleidoswap/sdk

# Install via pnpm
pnpm add @kaleidoswap/sdk

# Or install from source
git clone https://github.com/kaleidoswap/kaleido-sdk.git
cd kaleido-sdk/typescript-sdk
pnpm install
pnpm run build
```

**Requirements**: Node.js 18+

### Rust

```toml
# Add to Cargo.toml
[dependencies]
kaleidoswap-sdk = "0.1.0"

# Or install from source
git clone https://github.com/kaleidoswap/kaleido-sdk.git
cd kaleido-sdk/rust
cargo build
```

**Requirements**: Rust 1.70+

## Quick Start

### Python

```python
import asyncio
from kaleidoswap_sdk import KaleidoClient, PairQuoteRequest, SwapLegInput, Layer

async def main():
    client = KaleidoClient.create(
        base_url="https://api.kaleidoswap.com",
        node_url="https://node.kaleidoswap.com",
    )

    assets = await client.maker.list_assets()
    print(f"Available assets: {len(assets.assets)}")

    quote = await client.maker.get_quote(PairQuoteRequest(
        from_asset=SwapLegInput(asset_id="BTC", layer=Layer.BTC_LN, amount=100000),
        to_asset=SwapLegInput(asset_id="USDT", layer=Layer.RGB_LN),
    ))
    print(f"Quote: {quote.price}")

    await client.close()

if __name__ == "__main__":
    asyncio.run(main())
```

### TypeScript

```typescript
import { KaleidoClient } from 'kaleidoswap-sdk';

async function main() {
    const client = new KaleidoClient({
        baseUrl: 'https://api.kaleidoswap.com',
        nodeUrl: 'https://node.kaleidoswap.com'
    });
    
    // Get available assets
    const assets = await client.listAssets();
    console.log(`Available assets: ${assets.assets.length}`);
    
    // Get a quote
    const quote = await client.getQuote(
        'BTC',
        'USDT',
        100000000  // 1 BTC in satoshis
    );
    console.log(`Quote: ${quote.to_amount} USDT for 1 BTC`);
}

main().catch(console.error);
```

### Rust

```rust
use kaleidoswap_sdk::{KaleidoClient, KaleidoConfig};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = KaleidoConfig {
        api_url: "https://api.kaleidoswap.com".to_string(),
        node_url: "https://node.kaleidoswap.com".to_string(),
        api_key: None,
    };
    
    let client = KaleidoClient::new(config);
    
    // Get available assets
    let assets = client.list_assets().await?;
    println!("Available assets: {}", assets.assets.len());
    
    // Get a quote
    let quote = client.get_quote(
        "BTC",
        "USDT", 
        100000000  // 1 BTC in satoshis
    ).await?;
    println!("Quote: {} USDT for 1 BTC", quote.to_amount);
    
    Ok(())
}
```

## Documentation

This SDK comes with comprehensive documentation covering all aspects of usage:

### Core Documentation

- **[API Reference](API_REFERENCE.md)** - Complete API documentation with method signatures and examples
- **[Examples](EXAMPLES.md)** - Practical examples and usage patterns for real-world scenarios
- **[WebSocket Guide](WEBSOCKET.md)** - Detailed guide for real-time data streaming and WebSocket usage
- **[Error Handling](ERROR_HANDLING.md)** - Comprehensive error handling, troubleshooting, and debugging guide

### Quick Links

- [Installation](#installation) - Getting started with installation
- [Quick Start](#quick-start) - Basic usage examples
- [Configuration](#configuration) - Client configuration options
- [Market Operations](API_REFERENCE.md#market-operations) - List assets, pairs, get quotes
- [Swap Operations](API_REFERENCE.md#swap-operations) - Initialize and execute swaps
- [LSP Operations](API_REFERENCE.md#lsp-operations) - Lightning Service Provider operations
- [WebSocket Real-time](WEBSOCKET.md) - Real-time price feeds and low-latency operations
- [Error Handling](ERROR_HANDLING.md) - Robust error handling patterns

## Configuration

### Environment Variables

All SDKs support configuration via environment variables:

```bash
# API endpoints
KALEIDOSWAP_API_URL=https://api.kaleidoswap.com
KALEIDOSWAP_NODE_URL=https://node.kaleidoswap.com

# Authentication (optional)
KALEIDOSWAP_API_KEY=your-api-key

# WebSocket settings
KALEIDOSWAP_WS_PING_INTERVAL=30
KALEIDOSWAP_WS_TIMEOUT=10

# Retry settings
KALEIDOSWAP_MAX_RETRIES=3
KALEIDOSWAP_RETRY_DELAY=1
```

### Configuration Objects

#### Python

```python
from kaleidoswap_sdk import KaleidoClient

client = KaleidoClient.create(
    base_url="https://api.kaleidoswap.com",
    node_url="https://node.kaleidoswap.com",
    api_key="your-api-key",
    timeout=30.0,
    max_retries=3,
)
```

#### TypeScript

```typescript
import { KaleidoClient } from 'kaleidoswap-sdk';

const client = new KaleidoClient({
    baseUrl: 'https://api.kaleidoswap.com',
    nodeUrl: 'https://node.kaleidoswap.com',
    apiKey: 'your-api-key',     // Optional
    timeout: 30000,             // Request timeout (ms)
    retries: 3,                 // Max retries
    retryDelay: 1000,          // Retry delay (ms)
});
```

#### Rust

```rust
use kaleidoswap_sdk::{KaleidoClient, KaleidoConfig, RetryConfig};

let config = KaleidoConfig {
    api_url: "https://api.kaleidoswap.com".to_string(),
    node_url: "https://node.kaleidoswap.com".to_string(),
    api_key: Some("your-api-key".to_string()),
    timeout: Duration::from_secs(30),
    retry_config: RetryConfig {
        max_retries: 3,
        base_delay: Duration::from_secs(1),
        max_delay: Duration::from_secs(60),
    },
};

let client = KaleidoClient::new(config);
```

## Features by Implementation Status

### Python SDK ✅ (Most Complete)

- ✅ Market Operations (assets, pairs, quotes)
- ✅ Swap Operations (maker swaps, status tracking)
- ✅ LSP Operations (orders, channels)
- ✅ Node Operations (info, peers, addresses)
- ✅ WebSocket Support (real-time quotes, price streams)
- ✅ Comprehensive Error Handling
- ✅ Retry Logic and Circuit Breakers
- ✅ Full Type Safety with Pydantic Models

### TypeScript SDK 🔄 (Partially Complete)

- ✅ Basic Market Operations
- ✅ WebSocket Client
- ✅ Error Handling
- 🔄 Complete Swap Operations
- 🔄 Full LSP Operations
- 🔄 Complete Type Definitions

### Rust SDK 🚧 (In Development)

- 🚧 Basic Structure
- 🚧 HTTP Client
- 🚧 Core Operations
- ❌ WebSocket Support
- ❌ Complete Implementation

**Legend**: ✅ Complete | 🔄 Partial | 🚧 In Progress | ❌ Not Started

## Contributing

We welcome contributions to the Kaleidoswap SDK! Here's how you can help:

### Development Setup

```bash
# Clone the repository
git clone https://github.com/kaleidoswap/kaleido-sdk.git
cd kaleido-sdk

# Each SDK is maintained separately
cd python-sdk      # Python SDK
cd typescript-sdk  # TypeScript SDK

# Generate models from OpenAPI specs
make generate-python-sdk-models  # Python SDK
make generate-ts-types           # TypeScript SDK
```

### Ways to Contribute

1. **🐛 Bug Reports**: Report issues you encounter
2. **📖 Documentation**: Improve or add documentation
3. **💡 Examples**: Share practical usage examples
4. **🔧 Code**: Implement new features or fix bugs
5. **🧪 Testing**: Add tests and improve coverage
6. **🌐 Localization**: Translate documentation

### Contribution Guidelines

- Follow the existing code style and conventions
- Add tests for new functionality
- Update documentation for API changes
- Use descriptive commit messages
- Create focused pull requests

### Getting Help

- 📚 **Documentation**: This comprehensive guide covers most use cases
- 🐛 **Issues**: Search existing issues or create a new one
- 💬 **Discussions**: Join community discussions
- 📧 **Email**: Contact the team for private matters

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## Acknowledgments

- Thanks to all contributors who have helped build and improve this SDK
- Special thanks to the Kaleidoswap team for providing the underlying protocol
- Community feedback and suggestions have been invaluable

---

**Happy building with Kaleidoswap! 🎯** 