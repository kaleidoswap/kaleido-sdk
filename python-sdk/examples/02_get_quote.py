#!/usr/bin/env python3
"""
Example 02: Get Quote

Example showing how to get a quote for a swap.
"""

import asyncio
import logging

from kaleido_sdk import (
    KaleidoClient,
    Layer,
    PairQuoteRequest,
    SwapLegInput,
    to_display_units,
    to_smallest_units,
)

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
        base_url="https://api.staging.kaleidoswap.com",
        log_level=logging.DEBUG,
    )

    # Discover trading pairs
    print("Fetching available pairs...")
    pairs = await client.maker.list_pairs()

    if not pairs.pairs:
        print("No trading pairs available")
        return

    pair = pairs.pairs[0]
    print(f"\nUsing pair: {pair.base.ticker}/{pair.quote.ticker}")
    print(f"  Base precision: {pair.base.precision}")
    print(f"  Quote precision: {pair.quote.precision}")

    if pair.routes:
        print("  Available routes:")
        for route in pair.routes:
            print(f"    - {route.from_layer} -> {route.to_layer}")

    # Get a quote for 0.001 BTC
    amount = 0.001
    amount_raw = to_smallest_units(amount, pair.base.precision)

    print(f"\nGetting quote for {amount} {pair.base.ticker}...")
    print(f"  (raw amount: {amount_raw})")

    if pair.routes:
        from_layer = Layer(pair.routes[0].from_layer)
        to_layer = Layer(pair.routes[0].to_layer)
    else:
        from_layer = Layer.btc_ln
        to_layer = Layer.rgb_ln

    quote_request = PairQuoteRequest(
        from_asset=SwapLegInput(
            asset_id=pair.base.ticker,
            layer=from_layer,
            amount=amount_raw,
        ),
        to_asset=SwapLegInput(
            asset_id=pair.quote.ticker,
            layer=to_layer,
        ),
    )

    try:
        quote = await client.maker.get_quote(quote_request)

        from_display = to_display_units(quote.from_asset.amount, quote.from_asset.precision)
        to_display = to_display_units(quote.to_asset.amount, quote.to_asset.precision)

        print("\nQuote received:")
        print(f"  RFQ ID: {quote.rfq_id}")
        print(f"  From: {from_display} {quote.from_asset.ticker}")
        print(f"  To: {to_display} {quote.to_asset.ticker}")
        print(f"  Price: {quote.price}")
        print(f"  Fee: {quote.fee.final_fee} {quote.fee.fee_asset}")
        print(f"  Expires at: {quote.expires_at}")

    except Exception as e:
        print(f"\nError getting quote: {e}")
        print("(This is expected if the pair doesn't support the requested route)")


if __name__ == "__main__":
    asyncio.run(main())
