#!/usr/bin/env python3
"""
Example 08: Advanced Market Data

Shows how to inspect assets, pairs, direct routes, and multi-hop routes.
"""

import asyncio
import logging
import os

from kaleido_sdk import KaleidoClient, RoutesRequest, to_display_amount

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

    print("\nFetching assets and pairs...")
    assets = await client.maker.list_assets()
    pairs = await client.maker.list_pairs()

    print(f"Assets: {assets.total}")
    print(f"Pairs: {pairs.total}")

    print("\nSample assets:")
    for asset in assets.assets[:5]:
        print(f"  {asset.ticker}: {asset.name} (precision={asset.precision})")

    print("\nSample trading pairs:")
    for pair in pairs.pairs[:5]:
        route_summary = ", ".join(f"{route.from_layer}->{route.to_layer}" for route in pair.routes or [])
        print(f"  {pair.base.ticker}/{pair.quote.ticker} | routes: {route_summary or 'none'}")

    print("\nFinding direct routes for BTC/USDT...")
    routes = await client.maker.get_pair_routes("BTC/USDT")
    if routes:
        for route in routes:
            print(f"  {route.from_layer} -> {route.to_layer}")
    else:
        print("  No direct routes returned")

    print("\nDiscovering multi-hop routes for BTC -> USDT...")
    route_response = await client.maker.get_market_routes(
        RoutesRequest(from_asset="BTC", to_asset="USDT", max_hops=3)
    )
    print(f"  Found {len(route_response.routes)} route(s)")
    for route in route_response.routes[:3]:
        steps = " -> ".join(
            f"{step.from_asset}:{step.from_layer}->{step.to_asset}:{step.to_layer}"
            for step in route.steps
        )
        print(f"  hops={route.total_hops}: {steps}")

    btc_asset = next((asset for asset in assets.assets if asset.ticker == "BTC"), None)
    if btc_asset is not None:
        one_btc = to_display_amount(100_000_000, btc_asset.precision)
        print(f"\nPrecision check: 100000000 units = {one_btc} {btc_asset.ticker}")


if __name__ == "__main__":
    asyncio.run(main())
