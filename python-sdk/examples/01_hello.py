#!/usr/bin/env python3
"""
Example 01: Hello Kaleidoswap

Basic example showing how to create a client and list assets.
"""

import asyncio
from kaleidoswap_sdk import KaleidoClient, get_version, get_sdk_name


async def main() -> None:
    """Main entry point."""
    # Print SDK info
    print(f"{get_sdk_name()} v{get_version()}")
    print("-" * 40)

    # Create client
    client = KaleidoClient.create(
        base_url="https://api.kaleidoswap.com"
    )

    # Use async context manager for proper cleanup
    async with client:
        # List available assets
        print("\nFetching assets...")
        assets_response = await client.maker.list_assets()

        print(f"\nFound {assets_response.total} assets:")
        for asset in assets_response.assets[:5]:  # Show first 5
            print(f"  - {asset.ticker}: {asset.name} (precision: {asset.precision})")

        if assets_response.total > 5:
            print(f"  ... and {assets_response.total - 5} more")

        # List trading pairs
        print("\nFetching trading pairs...")
        pairs_response = await client.maker.list_pairs()

        print(f"\nFound {pairs_response.total} pairs:")
        for pair in pairs_response.pairs[:5]:  # Show first 5
            print(f"  - {pair.base.ticker}/{pair.quote.ticker}")

        if pairs_response.total > 5:
            print(f"  ... and {pairs_response.total - 5} more")


if __name__ == "__main__":
    asyncio.run(main())
