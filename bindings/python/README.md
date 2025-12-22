# Kaleidoswap Python SDK

Python bindings for the Kaleidoswap SDK - trade RGB assets on Bitcoin Lightning Network.

## Installation

```bash
pip install kaleidoswap
```

## Quick Start

```python
from kaleidoswap import KaleidoClient, KaleidoConfig
import json

# Create a client
config = KaleidoConfig(
    base_url="https://api.regtest.kaleidoswap.com",
    node_url=None,  # Optional RGB node URL
    timeout=30.0,
    max_retries=3,
    cache_ttl=60,
)
client = KaleidoClient(config)

# List available assets
assets_json = client.list_assets()
assets = json.loads(assets_json)
print(f"Found {len(assets)} assets")

# List trading pairs
pairs_json = client.list_pairs()
print(pairs_json)

# Get a quote (returns JSON string)
# Use get_best_quote for optimal routing (supports cross-protocol)
quote_json = client.get_best_quote(
    "BTC/USDT",
    1_000_000,  # 0.01 BTC (satoshis)
    None,       # to_amount
)
quote = json.loads(quote_json)
print(f"Quote Price: {quote.get('price')}")

# Legacy operations (Strongly Typed)
# These methods accept dictionaries or Pydantic models instead of JSON strings
init_request = {
    "rfq_id": quote["rfq_id"],
    "from_asset": quote["from_asset"]["asset_id"],
    "to_asset": quote["to_asset"]["asset_id"],
    "from_amount": quote["from_asset"]["amount"],
    "to_amount": quote["to_asset"]["amount"]
}
init_result_json = client.init_swap(init_request)
init_result = json.loads(init_result_json)
print(f"Payment Hash: {init_result['payment_hash']}")
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
