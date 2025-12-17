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

Demonstrates fetching market data:
- List available assets
- List trading pairs  
- Get quotes

```bash
python examples/market_data.py
```

### Atomic Swap (`atomic_swap.py`)

Demonstrates the complete swap flow:
- Connect to API and node
- Fetch pairs and quotes
- Show order history
- Display LSP info

```bash
# Set environment variables for node connection
export KALEIDO_NODE_URL="http://localhost:3001"

python examples/atomic_swap.py
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `KALEIDO_API_URL` | API endpoint | `https://api.regtest.kaleidoswap.com` |
| `KALEIDO_NODE_URL` | RGB-LN node URL | None |
