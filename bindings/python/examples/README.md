# Python Examples

Quick start guide for running Kaleidoswap SDK Python examples.

## Simple Examples

Start with these simple examples to learn the SDK:

### 01 - Hello
Connect to API and list assets:
```bash
uv run examples/01_hello.py
```

### 02 - Market Data  
Get trading pairs and prices:
```bash
uv run examples/02_market_data.py
```

### 03 - Get Quote
Request a price quote:
```bash
uv run examples/03_get_quote.py
```

### swap_example.py
Complete swap execution (advanced):
```bash
uv run examples/swap_example.py
```

## SDK Utilities

The SDK now includes helpful utilities in `kaleidoswap.utils`:

### Display Functions
```python
from kaleidoswap.utils import display_asset, display_pair, display_quote

# Pretty print an asset
print(display_asset(asset, verbose=True))

# Pretty print a trading pair
print(display_pair(pair))

# Pretty print a quote
print(display_quote(quote, verbose=True))
```

### Formatting Helpers
```python
from kaleidoswap.utils import format_amount, format_price

# Format amounts with correct units
formatted = format_amount(10000000, "BTC", "BTC_LN")  # "10,000,000 msat"

# Format prices
price_str = format_price(105395.40, decimals=2)  # "105,395.40"
```

### Logging
```python
from kaleidoswap.utils import get_logger

logger = get_logger("my_app")
logger.info("Starting swap...")
```

## Convenience Methods

The client now includes helper methods:

### Find Asset
```python
# Instead of filtering manually
usdt = client.find_asset("USDT")
```

### Find Pair
```python
# Quick pair lookup
pair = client.find_pair("BTC", "USDT")
```

### Simple Quote
```python
# Get quote with defaults
quote = client.get_simple_quote("BTC", "USDT", 10000000)
```

## Setup

### Prerequisites
- Python 3.8+
- [uv](https://github.com/astral-sh/uv) package manager

### Install Dependencies

```bash
cd bindings/python
uv sync --all-extras --dev
uv run maturin develop --uv
```

Or use the Makefile from the project root:

```bash
make dev-python
```

## Running Examples

### Using uv directly

```bash
cd bindings/python
KALEIDO_API_URL=http://localhost:8000 uv run examples/01_hello.py
```

### Using Makefile

```bash
make run-python-example
```

### Custom Configuration

Set environment variables:

```bash
export KALEIDO_API_URL=https://api.staging.kaleidoswap.com
export KALEIDO_NODE_URL=https://node.staging.kaleidoswap.com
uv run examples/01_hello.py
```

## Troubleshooting

### Service Not Available

Verify your local services are running:

```bash
make check-services
```

Or manually:

```bash
curl http://localhost:8000/health
curl http://localhost:3001/nodeinfo
```

## Best Practices

1. **Start with simple examples** before the complex swap example
2. **Use the helper methods** (`find_asset`, `find_pair`, etc.)
3. **Use display utilities** for pretty printing
4. **Enable logging** for debugging
5. **Check environment variables** are set correctly

## More Information

- [SDK Documentation](../../README.md)
- [API Reference](https://docs.kaleidoswap.com)
- [Unit Handling Guide](../../docs/UNITS.md)
