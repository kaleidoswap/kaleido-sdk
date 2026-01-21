# Kaleidoswap Python SDK

Pure Python SDK for interacting with the Kaleidoswap protocol. Trade RGB assets on Lightning Network with ease.

## Installation

```bash
pip install kaleidoswap-sdk
```

Or with development dependencies:

```bash
pip install kaleidoswap-sdk[dev]
```

## Quick Start

```python
import asyncio
from kaleidoswap_sdk import KaleidoClient

async def main():
    # Create client
    client = KaleidoClient.create(
        base_url="https://api.kaleidoswap.com"
    )

    async with client:
        # List available assets
        assets = await client.maker.list_assets()
        for asset in assets.assets:
            print(f"{asset.ticker}: {asset.name}")

        # Get trading pairs
        pairs = await client.maker.list_pairs()
        for pair in pairs.pairs:
            print(f"{pair.base.ticker}/{pair.quote.ticker}")

asyncio.run(main())
```

## Features

- **Async-first design** - All API methods are async using `asyncio`
- **Type-safe** - Full type hints with Pydantic models
- **Feature parity** - Matches the TypeScript SDK 1-to-1

### MakerClient (Market Operations)

```python
# List assets
assets = await client.maker.list_assets()

# List trading pairs
pairs = await client.maker.list_pairs()

# Get a quote
quote = await client.maker.get_quote(PairQuoteRequest(...))

# Create swap order
order = await client.maker.create_swap_order(CreateSwapOrderRequest(...))

# Get order status
status = await client.maker.get_swap_order_status(SwapOrderStatusRequest(...))

# LSP operations
lsp_info = await client.maker.get_lsp_info()
```

### RlnClient (RGB Lightning Node Operations)

Requires `node_url` configuration:

```python
client = KaleidoClient.create(
    base_url="https://api.kaleidoswap.com",
    node_url="http://localhost:3000"
)

# Node info
info = await client.rln.get_node_info()

# BTC operations
balance = await client.rln.get_btc_balance()
address = await client.rln.get_address()

# RGB asset operations
assets = await client.rln.list_assets()
await client.rln.send_asset(SendAssetRequest(...))

# Lightning channels
channels = await client.rln.list_channels()
await client.rln.open_channel(OpenChannelRequest(...))

# Payments
await client.rln.send_payment(SendPaymentRequest(...))
```

### WebSocket Streaming

```python
# Enable WebSocket
ws = client.maker.enable_websocket("wss://api.kaleidoswap.com/ws")

# Stream quotes
unsubscribe = await client.maker.stream_quotes(
    from_asset="BTC",
    to_asset="USDT",
    from_amount=100000,
    from_layer=Layer.BTC_LN,
    to_layer=Layer.RGB_LN,
    on_update=lambda quote: print(quote),
)

# Later: stop streaming
unsubscribe()
ws.disconnect()
```

## Utility Functions

```python
from kaleidoswap_sdk import to_smallest_units, to_display_units

# Convert BTC to satoshis
sats = to_smallest_units(1.5, 8)  # 150000000

# Convert satoshis to BTC
btc = to_display_units(150000000, 8)  # 1.5
```

## Error Handling

```python
from kaleidoswap_sdk import (
    KaleidoError,
    APIError,
    ValidationError,
    NotFoundError,
    NodeNotConfiguredError,
)

try:
    quote = await client.maker.get_quote(request)
except ValidationError as e:
    print(f"Invalid request: {e}")
except NotFoundError as e:
    print(f"Resource not found: {e}")
except APIError as e:
    print(f"API error ({e.status_code}): {e}")
except KaleidoError as e:
    print(f"SDK error: {e}")
```

## Development

```bash
# Install dev dependencies
pip install -e ".[dev]"

# Run tests
pytest

# Run tests with coverage
pytest --cov=kaleidoswap_sdk

# Type checking
mypy kaleidoswap_sdk

# Linting
ruff check kaleidoswap_sdk
```

## License

MIT
