# Kaleidoswap SDK

A multi-language SDK for interacting with the Kaleidoswap protocol, supporting Python, TypeScript, and Rust.

## Features

- REST API integration
- WebSocket real-time updates
- Swap operations (maker/taker)
- Asset management
- Channel management
- Payment handling

## Installation

### Python

```bash
pip install kaleidoswap-sdk
```

### TypeScript

```bash
npm install @kaleidoswap/sdk
```

### Rust

```toml
[dependencies]
kaleidoswap-sdk = "0.1.0"
```

## Quick Start

### Python

```python
from kaleidoswap_sdk import KaleidoClient

async def main():
    # Initialize client
    client = KaleidoClient(
        base_url="https://api.kaleidoswap.com",
        api_key="your-api-key"
    )
    
    # Connect to WebSocket
    await client.connect()
    
    # Get quote
    quote = await client.get_quote(
        from_asset="BTC",
        to_asset="USDT",
        amount=1.0,
        is_exact_input=True
    )
    
    # Initialize taker swap
    taker_init = await client.taker_init(
        swapstring="your-swap-string",
        taker_pubkey="your-pubkey"
    )
    
    # Execute taker swap
    taker_execute = await client.taker_execute(
        swapstring="your-swap-string",
        payment_hash=taker_init["payment_hash"],
        payment_secret=taker_init["payment_secret"]
    )
    
    # Clean up
    await client.disconnect()

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
```

### TypeScript

```typescript
import { KaleidoClient } from '@kaleidoswap/sdk';

async function main() {
    // Initialize client
    const client = new KaleidoClient({
        baseUrl: 'https://api.kaleidoswap.com',
        apiKey: 'your-api-key'
    });
    
    // Connect to WebSocket
    await client.connect();
    
    // Get quote
    const quote = await client.getQuote({
        fromAsset: 'BTC',
        toAsset: 'USDT',
        amount: 1.0,
        isExactInput: true
    });
    
    // Initialize taker swap
    const takerInit = await client.takerInit({
        swapstring: 'your-swap-string',
        takerPubkey: 'your-pubkey'
    });
    
    // Execute taker swap
    const takerExecute = await client.takerExecute({
        swapstring: 'your-swap-string',
        paymentHash: takerInit.paymentHash,
        paymentSecret: takerInit.paymentSecret
    });
    
    // Clean up
    await client.disconnect();
}

main().catch(console.error);
```

### Rust

```rust
use kaleidoswap_sdk::KaleidoClient;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize client
    let client = KaleidoClient::new(
        "https://api.kaleidoswap.com",
        Some("your-api-key")
    );
    
    // Connect to WebSocket
    client.connect().await?;
    
    // Get quote
    let quote = client.get_quote(
        "BTC",
        "USDT",
        1.0,
        true
    ).await?;
    
    // Initialize taker swap
    let taker_init = client.taker_init(
        "your-swap-string",
        "your-pubkey"
    ).await?;
    
    // Execute taker swap
    let taker_execute = client.taker_execute(
        "your-swap-string",
        &taker_init.payment_hash,
        &taker_init.payment_secret
    ).await?;
    
    // Clean up
    client.disconnect().await?;
    
    Ok(())
}
```

## Documentation

For detailed documentation, please visit our [documentation site](https://docs.kaleidoswap.com).

## Contributing

We welcome contributions! Please see our [contributing guidelines](CONTRIBUTING.md) for more information.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Roadmap

See our [ROADMAP.md](ROADMAP.md) for planned features and development timeline. 