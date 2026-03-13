#!/usr/bin/env python3
"""
Example 01: Hello Kaleidoswap

Basic example showing how to create a client and list assets.
"""

import asyncio
import logging

from kaleido_sdk import KaleidoClient, get_sdk_name, get_version

# ---------------------------------------------------------------------------
# Logging setup (application's responsibility — the SDK never does this)
# ---------------------------------------------------------------------------
# Show all SDK log levels. Change to logging.INFO or logging.WARNING to reduce noise.
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)-8s] %(name)s — %(message)s",
    datefmt="%H:%M:%S",
)
# Optionally silence the HTTP sub-logger if you only care about higher-level events:
# logging.getLogger("kaleido_sdk.http").setLevel(logging.WARNING)


async def main() -> None:
    """Main entry point."""
    # Print SDK info
    print(f"{get_sdk_name()} v{get_version()}")
    print("-" * 40)

    # Create client — log_level tells the SDK which records to emit
    client = KaleidoClient.create(
        base_url="https://api.staging.kaleidoswap.com",
        log_level=logging.DEBUG,
    )

    # List available assets
    print("\nFetching assets...")
    assets_response = await client.maker.list_assets()

    print(f"\nFound {assets_response.total} assets:")
    for asset in assets_response.assets[:5]:
        print(f"  - {asset.ticker}: {asset.name} (precision: {asset.precision})")

    if assets_response.total > 5:
        print(f"  ... and {assets_response.total - 5} more")

    # List trading pairs
    print("\nFetching trading pairs...")
    pairs_response = await client.maker.list_pairs()

    print(f"\nFound {pairs_response.total} pairs:")
    for pair in pairs_response.pairs[:5]:
        print(f"  - {pair.base.ticker}/{pair.quote.ticker}")

    if pairs_response.total > 5:
        print(f"  ... and {pairs_response.total - 5} more")


if __name__ == "__main__":
    asyncio.run(main())
