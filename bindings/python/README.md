# Kaleidoswap Python SDK

Python bindings for the Kaleidoswap SDK - trade RGB assets on Bitcoin Lightning Network.

## Installation

```bash
pip install kaleidoswap
```

## Quick Start

```python
from kaleidoswap import KaleidoClient

# Create a client
client = KaleidoClient.new(
    base_url="https://api.regtest.kaleidoswap.com",
    node_url=None,  # Optional RGB node URL
    timeout=30.0,
    max_retries=3,
    cache_ttl=60,
)

# List available assets
assets = client.list_assets()
print(assets)

# List trading pairs
pairs = client.list_pairs()
print(pairs)

# Get a quote
quote = client.get_quote(
    from_asset="BTC",
    to_asset="USDT",
    from_amount=100000,  # satoshis
    to_amount=None,
)
print(quote)
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
