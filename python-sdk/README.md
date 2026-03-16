# Kaleidoswap Python SDK

[![pypi package](https://img.shields.io/pypi/v/kaleido-sdk?label=pypi%20package)](https://pypi.org/project/kaleido-sdk/)

Python SDK for trading RGB assets on the Lightning Network via the Kaleidoswap protocol.

## Installation

```bash
pip install kaleido-sdk
```

## Quick Start

The SDK exposes two sub-clients depending on what you need:

| Sub-client | Config key | What it does |
|---|---|---|
| `client.maker` | `base_url` | Kaleidoswap market API — assets, quotes, swap orders, LSP |
| `client.rln` | `node_url` | Your RGB Lightning Node — wallet, channels, payments, RGB assets |

```python
from kaleido_sdk import KaleidoClient

# Zero-config — defaults to regtest
client = KaleidoClient.create()
assets = await client.maker.list_assets()

# Maker API only
client = KaleidoClient.create(base_url="https://api.kaleidoswap.com")
assets = await client.maker.list_assets()

# Node only (base_url still defaults to regtest)
client = KaleidoClient.create(node_url="http://localhost:3001")
info = await client.rln.get_node_info()

# Both together
client = KaleidoClient.create(
    base_url="https://api.kaleidoswap.com",
    node_url="http://localhost:3001",
)
pairs    = await client.maker.list_pairs()
channels = await client.rln.list_channels()
```

## Documentation

Full usage guide, API reference, and examples at **https://docs.kaleidoswap.com/sdk/introduction**

## License

MIT
