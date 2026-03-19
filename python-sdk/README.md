# Kaleidoswap Python SDK

Python SDK for trading RGB assets on the Lightning Network via the Kaleidoswap protocol.

## Installation

```bash
pip install kaleidoswap-sdk
```

## Quick Start

`KaleidoClient` organizes its functionality into two sub-clients that can be used **independently or together**:

| Sub-client | Config key | What it covers | Requires |
|---|---|---|---|
| `client.maker` | `base_url` | KaleidoSwap market API — assets, quotes, swap orders, atomic swaps, LSP | Public API URL |
| `client.rln` | `node_url` | Your RGB Lightning Node — wallet, channels, payments, RGB assets | Running RLN daemon |

### KaleidoSwap API only — no RLN node required

```python
import asyncio
from kaleido_sdk import KaleidoClient

async def main() -> None:
    client = KaleidoClient.create(base_url="https://api.signet.kaleidoswap.com")
    assets = await client.maker.list_assets()
    pairs  = await client.maker.list_pairs()

asyncio.run(main())
```

### RLN node only — no KaleidoSwap API required

```python
client = KaleidoClient.create(node_url="http://localhost:3001")
info     = await client.rln.get_node_info()
balance  = await client.rln.get_btc_balance()
channels = await client.rln.list_channels()
```

### Both together — full swap flow

```python
client = KaleidoClient.create(
    base_url="https://api.signet.kaleidoswap.com",
    node_url="http://localhost:3001",
)
pairs    = await client.maker.list_pairs()
channels = await client.rln.list_channels()
```

### Zero-config — defaults to regtest, no node

```python
client = KaleidoClient.create()
assets = await client.maker.list_assets()
```

> **Tip:** `KaleidoClient` also works as an async context manager (`async with KaleidoClient.create(...) as client`) for automatic HTTP connection cleanup in long-running applications.

## Documentation

Full usage guide, API reference, and examples at **https://docs.kaleidoswap.com/sdk/introduction**

## License

MIT
