#!/usr/bin/env python3
"""
Example usage of Kaleidoswap SDK client.

Demonstrates the high-level KaleidoClient API with Pydantic models.
"""

import asyncio

from kaleidoswap_sdk import KaleidoClient, PairQuoteRequest, SwapLegInput, Layer


async def example_list_assets():
    """List all available assets."""
    print("Listing all assets...")

    client = KaleidoClient.create(base_url="http://localhost:8000")

    response = await client.maker.list_assets()
    print(f"\nFound {len(response.assets)} assets:")
    for asset in response.assets[:5]:
        print(f"  - {asset.ticker:6s} - {asset.name}")


async def example_get_quote():
    """Get a swap quote."""
    print("\nGetting swap quote...")

    client = KaleidoClient.create(base_url="http://localhost:8000")

    request = PairQuoteRequest(
        from_asset=SwapLegInput(asset_id="BTC", layer=Layer.BTC_LN, amount=100000),
        to_asset=SwapLegInput(asset_id="USDT", layer=Layer.RGB_LN),
    )

    response = await client.maker.get_quote(request)
    print(f"\nQuote received:")
    print(f"  RFQ ID: {response.rfq_id}")
    print(f"  Price: {response.price}")


async def main():
    """Run all examples."""
    print("=" * 60)
    print("Kaleidoswap SDK - Client Examples")
    print("=" * 60)

    try:
        await example_list_assets()
        # await example_get_quote()  # Uncomment if API is available
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()

    print("\n" + "=" * 60)
    print("Examples completed!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
