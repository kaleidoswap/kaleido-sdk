#!/usr/bin/env python3
"""
Example 04: Create Swap Order

Demonstrates quote -> order request flow.
"""

import asyncio
import logging

from kaleidoswap_sdk import (
    CreateSwapOrderRequest,
    KaleidoClient,
    Layer,
    PairQuoteRequest,
    ReceiverAddress,
    ReceiverAddressFormat,
    SwapLegInput,
    to_smallest_units,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)-8s] %(name)s - %(message)s",
    datefmt="%H:%M:%S",
)


async def main() -> None:
    client = KaleidoClient.create(base_url="https://api.staging.kaleidoswap.com")

    pairs = await client.maker.list_pairs()
    if not pairs.pairs:
        print("No pairs available")
        return

    pair = next((p for p in pairs.pairs if p.routes), None)
    if pair is None:
        print("No tradable pair with routes available")
        return

    route = pair.routes[0]
    amount_raw = to_smallest_units(0.001, pair.base.precision)

    quote_request = PairQuoteRequest(
        from_asset=SwapLegInput(
            asset_id=pair.base.ticker,
            layer=Layer(route.from_layer),
            amount=amount_raw,
        ),
        to_asset=SwapLegInput(
            asset_id=pair.quote.ticker,
            layer=Layer(route.to_layer),
        ),
    )

    quote = await client.maker.get_quote(quote_request)
    print(f"RFQ ID: {quote.rfq_id}")

    order_request = CreateSwapOrderRequest(
        rfq_id=quote.rfq_id,
        from_asset=quote.from_asset,
        to_asset=quote.to_asset,
        receiver_address=ReceiverAddress(
            address="bc1qexampledestinationaddress0000000000000000",
            format=ReceiverAddressFormat.BTC_ADDRESS,
        ),
    )

    try:
        order = await client.maker.create_swap_order(order_request)
        print(f"Created order: {order.id}")
        print(f"Status: {order.status}")
    except Exception as exc:
        print("Order creation failed (often expected in demo env without a valid receiver):")
        print(f"  {exc}")


if __name__ == "__main__":
    asyncio.run(main())
