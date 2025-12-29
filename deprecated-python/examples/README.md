# Kaleidoswap Python SDK Examples

This directory contains comprehensive examples demonstrating how to use the Kaleidoswap Python SDK.

## Prerequisites

1. Install the SDK:
```bash
cd kaleido-sdk/python
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
uv pip install -e .
```

2. Set up environment variables (optional):
```bash
export KALEIDO_API_URL="https://api.staging.kaleidoswap.com"
export KALEIDO_NODE_URL="http://localhost:3001"
export KALEIDO_API_KEY="your_api_key_here"
```

## Examples Overview

### 1. **market_data.py** - Basic Market Data
**What it covers:**
- Listing available assets
- Listing trading pairs
- Getting node information
- Fetching price quotes

**Run:**
```bash
python examples/market_data.py
```

### 2. **websocket_quotes.py** - Real-time WebSocket Quotes
**What it covers:**
- Connecting to WebSocket API
- Getting real-time price quotes
- Handling multiple quote requests
- WebSocket authentication

**Run:**
```bash
python examples/websocket_quotes.py
```

**Note:** Requires API key for authentication.

### 3. **atomic_swap.py** - Complete Atomic Swap Flow
**What it covers:**
- End-to-end atomic swap execution
- Quote fetching via WebSocket
- Swap initialization
- Trade whitelisting
- Swap execution
- Status monitoring

**Run:**
```bash
python examples/atomic_swap.py
```

**Note:** Requires both API server and RGB Lightning Node.

### 4. **lsps1_channel_purchase.py** - LSPS1 Channel Purchase
**What it covers:**
- Getting LSP information
- Estimating channel fees
- Creating channel purchase orders
- Handling payment options (Lightning + Onchain)
- Order status monitoring
- Order history and analytics

**Run:**
```bash
python examples/lsps1_channel_purchase.py
```

### 5. **swap_orders.py** - Swap Orders Management
**What it covers:**
- Creating automated swap orders
- Checking order status
- Viewing order history
- Managing rate decisions
- Order analytics

**Run:**
```bash
python examples/swap_orders.py
```

### 6. **advanced_market_data.py** - Advanced Market Data Operations
**What it covers:**
- Finding assets by ticker
- Finding trading pairs by ticker
- Amount conversions (display ↔ atomic units)
- Amount validation
- Quote requests by ticker/pair
- Cache management

**Run:**
```bash
python examples/advanced_market_data.py
```

### 7. **error_handling.py** - Error Handling Best Practices
**What it covers:**
- Authentication errors
- Validation errors
- Timeout handling
- Retry strategies with exponential backoff
- Rate limit handling
- Proper resource cleanup
- Context manager usage

**Run:**
```bash
python examples/error_handling.py
```

## Common Patterns

### Basic Client Initialization
```python
from kaleidoswap_sdk.client import KaleidoClient

# Minimal setup (API only)
client = KaleidoClient(
    base_url="https://api.staging.kaleidoswap.com"
)

# With RGB Lightning Node
client = KaleidoClient(
    base_url="https://api.staging.kaleidoswap.com",
    node_url="http://localhost:3001"
)

# With authentication
client = KaleidoClient(
    base_url="https://api.staging.kaleidoswap.com",
    api_key="your_api_key_here"
)

# Don't forget to close
await client.close()
```

### Using Context Manager (Recommended)
```python
async with KaleidoClient(base_url=API_URL) as client:
    assets = await client.list_assets()
    # Client automatically closed when exiting context
```

### Error Handling
```python
from kaleidoswap_sdk.exceptions import (
    NetworkError,
    AuthenticationError,
    ValidationError
)

try:
    result = await client.some_operation()
except AuthenticationError as e:
    logger.error(f"Authentication failed: {e}")
except ValidationError as e:
    logger.error(f"Invalid parameters: {e}")
except NetworkError as e:
    logger.error(f"Network error: {e}")
```

### Retry Logic
```python
max_retries = 3
retry_delay = 1.0

for attempt in range(max_retries):
    try:
        result = await client.some_operation()
        break
    except NetworkError:
        if attempt < max_retries - 1:
            await asyncio.sleep(retry_delay)
            retry_delay *= 2  # Exponential backoff
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `KALEIDO_API_URL` | Kaleidoswap API endpoint | `https://api.staging.kaleidoswap.com` |
| `KALEIDO_NODE_URL` | RGB Lightning Node endpoint | `http://localhost:3001` |
| `KALEIDO_API_KEY` | API authentication key | None |

### API Endpoints

- **Production**: `https://api.kaleidoswap.com`
- **Staging**: `https://api.staging.kaleidoswap.com`
- **Regtest**: `https://api.regtest.kaleidoswap.com`
- **Local**: `http://localhost:8000`

## Tips and Best Practices

1. **Always use async context managers** for automatic resource cleanup
2. **Implement retry logic** for network operations
3. **Validate amounts** before submitting swap requests
4. **Use WebSocket** for real-time quotes (faster than HTTP)
5. **Cache asset/pair information** to reduce API calls
6. **Handle timeouts gracefully** with appropriate timeout values
7. **Use display units** for user-facing amounts, convert to atomic units internally
8. **Check swap status regularly** during swap execution
9. **Store sensitive data** (API keys) in environment variables, not in code
10. **Log errors** with sufficient context for debugging

## Troubleshooting

### WebSocket Connection Fails (HTTP 403)
- Ensure you're providing a valid API key
- Check that the WebSocket URL is correct (should include `/api/v1`)

### Swap Timeout Errors
- Increase the timeout value in `wait_for_swap_completion()`
- Check that both maker and taker nodes are running
- Verify the swap was properly whitelisted

### Rate Limit Errors
- Implement request throttling
- Use exponential backoff for retries
- Consider caching responses when appropriate

### Authentication Errors
- Verify your API key is valid
- Check that the API key is being passed to the client
- Ensure you're using the correct environment (staging/production)

## Need Help?

- **Documentation**: https://docs.kaleidoswap.com
- **API Reference**: https://api.kaleidoswap.com/docs
- **GitHub Issues**: https://github.com/kaleidoswap/kaleido-sdk/issues
- **Discord**: https://discord.gg/kaleidoswap

## Contributing

Found a bug or want to add an example? Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Add your example with documentation
4. Submit a pull request

## License

See the main repository LICENSE file for details.

