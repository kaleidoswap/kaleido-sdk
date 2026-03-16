#!/usr/bin/env python3
"""
Example 07: Swap Demo

Atomic-swap flow following the integration tests:
1. Get a fresh quote
2. Initialize the swap
3. Print the generated swapstring and payment hash
"""

import asyncio
import logging
import os

from kaleido_sdk import KaleidoClient, Layer, PairQuoteRequest, SwapLegInput, SwapRequest

API_URL = os.getenv("KALEIDO_API_URL", "https://api.staging.kaleidoswap.com")

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

    print(f"Maker API: {API_URL}")
    print("-" * 40)

    print("\nRequesting a fresh BTC -> USDT quote...")
    quote = await client.maker.get_quote(
        PairQuoteRequest(
            from_asset=SwapLegInput(
                asset_id="BTC",
                layer=Layer.BTC_LN,
                amount=4_100_000,
            ),
            to_asset=SwapLegInput(
                asset_id="USDT",
                layer=Layer.RGB_LN,
            ),
        )
    )

    print(f"RFQ ID: {quote.rfq_id}")
    print(f"From: {quote.from_asset.amount} {quote.from_asset.ticker}")
    print(f"To: {quote.to_asset.amount} {quote.to_asset.ticker}")
    print(f"Price: {quote.price}")

    print("\nInitializing atomic swap...")
    swap = await client.maker.init_swap(
        SwapRequest(
            rfq_id=quote.rfq_id,
            from_asset=quote.from_asset.asset_id,
            from_amount=quote.from_asset.amount,
            to_asset=quote.to_asset.asset_id,
            to_amount=quote.to_asset.amount,
        )
    )

    print("\nSwap initialized:")
    print(f"  Payment hash: {swap.payment_hash}")
    print(f"  Swapstring length: {len(swap.swapstring)}")
    print(f"  Swapstring preview: {swap.swapstring[:80]}...")


if __name__ == "__main__":
    asyncio.run(main())
