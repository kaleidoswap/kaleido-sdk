# Getting Started with Kaleidoswap SDK

Welcome to the Kaleidoswap SDK! This guide will help you get up and running quickly with the right SDK implementation for your needs.

## Quick Decision Matrix

| Use Case | Recommended SDK | Completeness | Best For |
|----------|----------------|--------------|----------|
| Production Trading Bot | Python | ✅ Complete | High-frequency trading, complex workflows |
| Web Application | TypeScript | 🔄 Partial | Frontend apps, Node.js backends |
| High-Performance App | Rust | 🚧 In Progress | Low-latency, system-level applications |
| Learning/Prototyping | Python | ✅ Complete | Quick experimentation, tutorials |

## 5-Minute Quick Start

### 1. Choose Your SDK

**For most users, we recommend starting with Python** as it has the most complete implementation.

### 2. Install the SDK

```bash
# Python (Recommended)
pip install kaleidoswap-sdk

# TypeScript
npm install @kaleidoswap/sdk

# Rust
cargo add kaleidoswap-sdk
```

### 3. Your First API Call

#### Python
```python
import asyncio
from kaleidoswap_sdk.client import KaleidoClient

async def first_call():
    async with KaleidoClient(
        api_url="https://api.kaleidoswap.com",
        node_url="https://node.kaleidoswap.com"
    ) as client:
        
        # Get available assets
        assets = await client.list_assets()
        print(f"Available assets: {len(assets.assets)}")
        
        # Get a quote
        quote = await client.get_quote(
            from_asset="BTC",
            to_asset="USDT",
            from_amount=100000000  # 1 BTC in satoshis
        )
        print(f"1 BTC = ${quote.price:.2f} USDT")

asyncio.run(first_call())
```

#### TypeScript
```typescript
import { KaleidoClient } from '@kaleidoswap/sdk';

async function firstCall() {
    const client = new KaleidoClient({
        baseUrl: 'https://api.kaleidoswap.com',
        nodeUrl: 'https://node.kaleidoswap.com'
    });
    
    const assets = await client.listAssets();
    console.log(`Available assets: ${assets.assets.length}`);
    
    const quote = await client.getQuote('BTC', 'USDT', 100000000);
    console.log(`1 BTC = $${quote.price.toFixed(2)} USDT`);
}

firstCall();
```

### 4. Next Steps

- 📖 **Read the [API Reference](API_REFERENCE.md)** for complete method documentation
- 💡 **Explore [Examples](EXAMPLES.md)** for practical usage patterns
- 🔄 **Try [WebSocket streaming](WEBSOCKET.md)** for real-time data
- 🛠️ **Learn [Error Handling](ERROR_HANDLING.md)** for production use

## Common Use Cases

### Market Data Analysis

**What you need**: Real-time price data, asset information, historical quotes

**Recommended approach**:
1. Start with [Basic Market Data examples](EXAMPLES.md#basic-market-data)
2. Implement [WebSocket price streaming](WEBSOCKET.md#price-streaming)
3. Add [error handling](ERROR_HANDLING.md) for production

```python
# See full example in EXAMPLES.md
async def analyze_market():
    async with KaleidoClient(...) as client:
        assets = await client.list_assets()
        # Analyze asset data...
```

### Trading Bot Development

**What you need**: Quote requests, swap execution, order management

**Recommended approach**:
1. Master [Swap Operations](API_REFERENCE.md#swap-operations)
2. Implement [robust error handling](ERROR_HANDLING.md#retry-patterns)
3. Use [advanced patterns](EXAMPLES.md#advanced-swap-workflows) for complex strategies

```python
# See full trading bot example in EXAMPLES.md
class TradingBot:
    async def execute_strategy(self):
        # Implement your trading logic
```

### DeFi Integration

**What you need**: LSP operations, channel management, payment handling

**Recommended approach**:
1. Learn [LSP Operations](API_REFERENCE.md#lsp-operations)
2. Study [channel management examples](EXAMPLES.md#lsp-channel-management)
3. Implement [connection resilience](ERROR_HANDLING.md#network-issues)

### Real-time Dashboard

**What you need**: Live price feeds, WebSocket connections, UI updates

**Recommended approach**:
1. Use TypeScript SDK for web integration
2. Follow [WebSocket patterns](WEBSOCKET.md#real-time-quotes)
3. Implement [reconnection handling](WEBSOCKET.md#advanced-patterns)

## Development Workflow

### 1. Development Environment Setup

```bash
# Clone the repository
git clone https://github.com/kaleidoswap/kaleido-sdk.git
cd kaleido-sdk

# For Python development
cd python
pip install -e .
pip install -r requirements-dev.txt

# For TypeScript development
cd typescript
npm install
npm run build

# For Rust development
cd rust
cargo build
```

### 2. Testing Your Integration

```python
# Start with simple operations
async def test_integration():
    client = KaleidoClient(
        api_url="https://testnet-api.kaleidoswap.com",  # Use testnet
        node_url="https://testnet-node.kaleidoswap.com"
    )
    
    try:
        # Test basic connectivity
        assets = await client.list_assets()
        print("✅ API connectivity working")
        
        # Test quote functionality
        quote = await client.get_quote("BTC", "USDT", 1000000)
        print("✅ Quote functionality working")
        
        # Test WebSocket (if needed)
        await client.connect()
        print("✅ WebSocket connectivity working")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
    finally:
        await client.disconnect()
```

### 3. Production Checklist

Before deploying to production:

- [ ] **Error Handling**: Implement comprehensive error handling
- [ ] **Logging**: Set up proper logging and monitoring
- [ ] **Rate Limiting**: Implement client-side rate limiting
- [ ] **Security**: Secure API keys and credentials
- [ ] **Testing**: Test all critical paths thoroughly
- [ ] **Monitoring**: Set up alerts for failures and performance
- [ ] **Documentation**: Document your integration
- [ ] **Backup Plan**: Have fallback mechanisms

## Troubleshooting

### Can't Connect to API

1. **Check URLs**: Ensure you're using the correct API endpoints
2. **Network**: Test basic connectivity with curl/ping
3. **Firewall**: Check if your firewall blocks outbound connections
4. **DNS**: Verify DNS resolution works

```bash
# Test connectivity
curl -I https://api.kaleidoswap.com/health
```

### Authentication Issues

1. **API Key**: Verify your API key is correct and active
2. **Permissions**: Check if your key has required permissions
3. **Headers**: Ensure authentication headers are set correctly

### WebSocket Problems

1. **URL Format**: Check WebSocket URL format (ws:// or wss://)
2. **Proxy**: Configure proxy settings if behind corporate firewall
3. **Reconnection**: Implement proper reconnection logic

See the [Error Handling Guide](ERROR_HANDLING.md) for detailed troubleshooting.

## Performance Optimization

### For High-Frequency Trading

1. **Use WebSocket**: Minimize latency with WebSocket connections
2. **Connection Pooling**: Reuse HTTP connections
3. **Local Caching**: Cache frequently accessed data
4. **Async Operations**: Use async/await properly

```python
# Example: Optimized quote requests
async def optimized_quotes():
    async with KaleidoClient(...) as client:
        await client.connect()  # WebSocket connection
        
        # Use WebSocket for low-latency quotes
        quote = await client.get_quote_websocket(...)
```

### For Large-Scale Applications

1. **Rate Limiting**: Implement proper rate limiting
2. **Circuit Breakers**: Use circuit breaker patterns
3. **Monitoring**: Monitor API usage and performance
4. **Load Balancing**: Distribute load across multiple instances

## SDK Comparison

| Feature | Python | TypeScript | Rust |
|---------|--------|------------|------|
| **Market Data** | ✅ Complete | ✅ Complete | 🚧 Basic |
| **Swap Operations** | ✅ Complete | 🔄 Partial | 🚧 Basic |
| **LSP Operations** | ✅ Complete | 🔄 Partial | ❌ None |
| **WebSocket** | ✅ Complete | ✅ Complete | ❌ None |
| **Error Handling** | ✅ Complete | ✅ Good | 🚧 Basic |
| **Type Safety** | ✅ Pydantic | ✅ TypeScript | ✅ Rust |
| **Performance** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Ease of Use** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Documentation** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

## Migration Guide

### From REST to WebSocket

If you're currently using REST endpoints and want to move to WebSocket for better performance:

```python
# Before: REST
quote = await client.get_quote("BTC", "USDT", 100000000)

# After: WebSocket
await client.connect()
quote = await client.get_quote_websocket(
    QuoteRequest(from_asset="BTC", to_asset="USDT", from_amount=100000000)
)
```

### Between SDK Languages

When migrating between SDK implementations, the core concepts remain the same, but syntax differs:

```python
# Python
assets = await client.list_assets()
```

```typescript
// TypeScript
const assets = await client.listAssets();
```

```rust
// Rust
let assets = client.list_assets().await?;
```

## Getting Help

### Documentation Resources

1. **[API Reference](API_REFERENCE.md)** - Complete method documentation
2. **[Examples](EXAMPLES.md)** - Real-world usage patterns
3. **[WebSocket Guide](WEBSOCKET.md)** - Real-time data streaming
4. **[Error Handling](ERROR_HANDLING.md)** - Troubleshooting and debugging

### Community Support

- **GitHub Issues**: Report bugs and request features
- **Discord**: Join our developer community
- **Documentation**: Contribute to improving docs
- **Examples**: Share your integration examples

### Support Levels

| Type | Response Time | Coverage |
|------|--------------|----------|
| **Community** | Best effort | General questions, examples |
| **Business** | 24-48 hours | Integration support, consultation |
| **Enterprise** | 4-8 hours | Priority support, custom features |

## Next Steps

Now that you're familiar with the basics:

1. **Dive Deep**: Pick a use case and explore the relevant documentation section
2. **Build Something**: Start with a simple project using the examples
3. **Join Community**: Connect with other developers using the SDK
4. **Contribute**: Help improve the SDK and documentation

Remember: Start simple, build incrementally, and don't hesitate to ask for help when needed!

---

**Ready to build something amazing? Let's go! 🚀** 