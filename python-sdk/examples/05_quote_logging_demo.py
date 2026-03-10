#!/usr/bin/env python3
"""
Example 05: Quote Logging Demo

Shows SDK logging while requesting quotes.
"""

import asyncio
import logging

from kaleidoswap_sdk import KaleidoClient, Layer, PairQuoteRequest, SwapLegInput

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)-8s] %(name)s - %(message)s",
    datefmt="%H:%M:%S",
)

# Reduce HTTP noise while keeping maker and ws events visible.
logging.getLogger("kaleidoswap_sdk.http").setLevel(logging.INFO)


async def main() -> None:
    client = KaleidoClient.create(
        base_url="https://api.staging.kaleidoswap.com",
        log_level=logging.DEBUG,
    )

    pairs = await client.maker.list_pairs()
    if not pairs.pairs:
        print("No pairs available")
        return

    pair = next((p for p in pairs.pairs if p.routes), pairs.pairs[0])
    route = pair.routes[0] if pair.routes else None

    from_layer = Layer(route.from_layer) if route else Layer.BTC_LN
    to_layer = Layer(route.to_layer) if route else Layer.RGB_LN

    req = PairQuoteRequest(
        from_asset=SwapLegInput(
            asset_id=pair.base.ticker,
            layer=from_layer,
            amount=100000,
        ),
        to_asset=SwapLegInput(
            asset_id=pair.quote.ticker,
            layer=to_layer,
        ),
    )

    quote = await client.maker.get_quote(req)
    print("Quote summary:")
    print(f"  RFQ: {quote.rfq_id}")
    print(f"  Price: {quote.price}")
    print(f"  Expires: {quote.expires_at}")


if __name__ == "__main__":
    asyncio.run(main())
