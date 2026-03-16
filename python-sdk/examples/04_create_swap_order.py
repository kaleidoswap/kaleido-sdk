#!/usr/bin/env python3
"""
Example 04: Create Swap Order

Test-backed swap-order flow:
1. Find the RGB asset ID for USDT
2. Get a fresh quote for USDT(RGB_LN) -> BTC(BTC_L1)
3. Ask the local node for a valid BTC receiver address
4. Create a swap order
"""

import asyncio
import logging
import os

from kaleido_sdk import (
    CreateSwapOrderRequest,
    KaleidoClient,
    Layer,
    PairQuoteRequest,
    ReceiverAddress,
    ReceiverAddressFormat,
    SwapLegInput,
)

API_URL = os.getenv("KALEIDO_API_URL", "https://api.staging.kaleidoswap.com")
NODE_URL = os.getenv("KALEIDO_NODE_URL", "http://localhost:3001")

# ---------------------------------------------------------------------------
# Logging setup (application's responsibility — the SDK never does this)
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)-8s] %(name)s — %(message)s",
    datefmt="%H:%M:%S",
)


async def main() -> None:
    """Main entry point."""
    client = KaleidoClient.create(
        base_url=API_URL,
        log_level=logging.DEBUG,
    )
    node_client = KaleidoClient.create(
        base_url=API_URL,
        node_url=NODE_URL,
        log_level=logging.DEBUG,
    )

    print(f"Maker API: {API_URL}")
    print(f"Node URL: {NODE_URL}")
    print("-" * 40)

    print("\nFetching assets...")
    assets = await client.maker.list_assets()
    usdt_asset = next((asset for asset in assets.assets if asset.ticker == "USDT"), None)
    if usdt_asset is None:
        print("USDT asset not found in maker asset list")
        return

    protocol_ids = usdt_asset.protocol_ids or {}
    rgb_asset_id = protocol_ids.get("RGB")
    if rgb_asset_id is None:
        print("USDT RGB asset id not found in protocol_ids")
        return

    print(f"Using RGB asset id for USDT: {rgb_asset_id}")

    print("\nRequesting quote for USDT(RGB_LN) -> BTC(BTC_L1)...")
    quote = await client.maker.get_quote(
        PairQuoteRequest(
            from_asset=SwapLegInput(
                asset_id=rgb_asset_id,
                layer=Layer.RGB_LN,
                amount=1_000_000,
            ),
            to_asset=SwapLegInput(
                asset_id="BTC",
                layer=Layer.BTC_L1,
            ),
        )
    )

    print(f"RFQ ID: {quote.rfq_id}")
    print(f"From: {quote.from_asset.amount} {quote.from_asset.ticker}")
    print(f"To: {quote.to_asset.amount} {quote.to_asset.ticker}")

    print("\nFetching a valid BTC address from the local node...")
    address_response = await node_client.rln.get_address()
    receiver_address = address_response.address
    print(f"Receiver address: {receiver_address}")

    order_request = CreateSwapOrderRequest(
        rfq_id=quote.rfq_id,
        from_asset=quote.from_asset,
        to_asset=quote.to_asset,
        receiver_address=ReceiverAddress(
            address=receiver_address,
            format=ReceiverAddressFormat.BTC_ADDRESS,
        ),
        min_onchain_conf=1,
        refund_address=receiver_address,
        email="test@example.com",
    )

    print("\nCreating swap order...")
    order = await client.maker.create_swap_order(order_request)

    print("\nOrder created:")
    print(f"  Order ID: {order.id}")
    print(f"  RFQ ID: {order.rfq_id}")
    print(f"  Status: {order.status}")
    if order.deposit_address is not None:
        print(f"  Deposit address: {order.deposit_address.address}")
        print(f"  Deposit format: {order.deposit_address.format}")


if __name__ == "__main__":
    asyncio.run(main())
