# Kaleidoswap Python SDK

Python SDK for trading RGB assets on the Lightning Network via the Kaleidoswap protocol.

## Installation

```bash
pip install kaleidoswap-sdk
```

## Quick Start

```python
from kaleidoswap_sdk import KaleidoClient

client = KaleidoClient.create(base_url="https://api.kaleidoswap.com")

assets = await client.maker.list_assets()
pairs  = await client.maker.list_pairs()
```

## Documentation

Full usage guide, API reference, and examples at **https://docs.kaleidoswap.com/sdk/introduction**

## License

MIT
