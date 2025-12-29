# Python SDK Examples

This directory contains example scripts demonstrating the Kaleidoswap Python SDK.

## Prerequisites

Install the SDK:
```bash
cd kaleido-sdk/bindings/python
maturin develop
```

## Examples

### Market Data (`market_data.py`)
Basic market data operations:
- List available assets and trading pairs
- Get quotes
```bash
python examples/market_data.py
```

### Advanced Market Data (`advanced_market_data.py`)
Advanced features:
- Asset/pair lookup by ticker
- Amount conversion (display ↔ atomic units)
- Amount validation
- Cache management
```bash
python examples/advanced_market_data.py
```

### Atomic Swap (`atomic_swap.py`)
Complete swap flow demo:
- Connect to API and node
- Fetch pairs and quotes
- Show order history and LSP info
```bash
export KALEIDO_NODE_URL="http://localhost:3001"
python examples/atomic_swap.py
```

### Error Handling (`error_handling.py`)
Best practices for error handling:
- Exception handling patterns
- Input validation
- Retry strategies with exponential backoff
- Graceful degradation
```bash
python examples/error_handling.py
```

### Swap Orders (`swap_orders.py`)
Order management:
- View order history
- Get order analytics
- Quote operations
```bash
python examples/swap_orders.py
```

### LSPS1 Channel Info (`lsps1_channel_info.py`)
Lightning channel operations:
- Get LSP and network info
- Fee estimation
- Channel and peer listing
```bash
python examples/lsps1_channel_info.py
```

### WebSocket Quotes (`websocket_quotes.py`)
Real-time streaming:
- Create quote streams
- Receive live updates
- HTTP fallback
```bash
python examples/websocket_quotes.py
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `KALEIDO_API_URL` | API endpoint | `https://api.regtest.kaleidoswap.com` |
| `KALEIDO_NODE_URL` | RGB-LN node URL | None |

