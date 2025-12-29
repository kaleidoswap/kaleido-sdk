# Kaleidoswap Python SDK

Python bindings for the Kaleidoswap SDK - trade RGB assets on Bitcoin Lightning Network.

## Installation

```bash
pip install kaleidoswap
```

## Quick Start

```python
from kaleidoswap import KaleidoClient, KaleidoConfig

# Create a client
config = KaleidoConfig(
    base_url="https://api.regtest.kaleidoswap.com",
    node_url=None,  # Optional RGB node URL
)
client = KaleidoClient(config)

# List available assets
assets = client.list_assets()
print(f"Found {len(assets)} assets")

# Get asset by ticker
btc = client.get_asset_by_ticker("BTC")
print(f"BTC precision: {btc.precision}")

# Get a quote
quote = client.get_quote_by_pair("BTC/USDT", from_amount=1_000_000)
print(f"Quote: {quote.from_asset.amount} → {quote.to_asset.amount}")
```

## Convenience Methods

### Amount Conversion

```python
# Convert display amount to atomic units (satoshis)
raw = client.to_raw(1.5, btc)  # 150000000

# Convert atomic units back to display
display = client.to_display(raw, btc)  # 1.5

# Flexible conversion
raw = client.convert_amount(2.5, "BTC", to="raw")
```

### Validation & Trade Helpers

```python
# Check if pair is tradeable
can_trade = client.can_trade("BTC", "USDT")

# Validate amount
result = client.validate_amount(0.01, "BTC")
if result["valid"]:
    print(f"Raw amount: {result['raw_amount']}")
else:
    print(f"Errors: {result['errors']}")

# Refresh cache
client.refresh_cache()
```

### High-Level Swap Flows

```python
# Execute complete swap flow (init + whitelist + execute + wait)
result = client.execute_swap_flow(
    rfq_id=quote.rfq_id,
    from_asset=quote.from_asset.asset_id,
    to_asset=quote.to_asset.asset_id,
    from_amount=quote.from_asset.amount,
    to_amount=quote.to_asset.amount,
    taker_pubkey=pubkey,
    wait_for_completion=True,
)

# Or execute swap by pair ticker
result = client.execute_swap_by_pair(
    pair_ticker="BTC/USDT",
    amount=0.01,  # Display units
    side="sell",
    taker_pubkey=pubkey,
)
```

## Examples

See the [examples/](examples/) directory for complete usage examples.
```

## Development

### Building from Source

Requires Rust and maturin:

```bash
# Install maturin
pip install maturin

# Build in development mode
maturin develop

# Build release wheel
maturin build --release
```

### Running Tests

```bash
# Install dev dependencies
pip install -e ".[dev]"

# Run tests
pytest tests/ -v
```

## License

MIT License - see [LICENSE](../../LICENSE) for details.
