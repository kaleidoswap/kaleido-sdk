#!/usr/bin/env python3
"""
Example 08: Advanced Market Data

Shows asset/pair analysis and route discovery.
"""

import asyncio
import logging

from kaleido_sdk import KaleidoClient, RoutesRequest

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)-8s] %(name)s - %(message)s",
    datefmt="%H:%M:%S",
)


async def main() -> None:
    client = KaleidoClient.create(base_url="https://api.staging.kaleidoswap.com")

    assets = await client.maker.list_assets()
    pairs = await client.maker.list_pairs()

    print(f"Assets: {assets.total}")
    print(f"Pairs: {pairs.total}")

    pair_counts: dict[str, int] = {}
    for pair in pairs.pairs:
        pair_counts[pair.base.ticker] = pair_counts.get(pair.base.ticker, 0) + 1
        pair_counts[pair.quote.ticker] = pair_counts.get(pair.quote.ticker, 0) + 1

    top_assets = sorted(pair_counts.items(), key=lambda item: item[1], reverse=True)[:5]
    print("Top assets by pair connectivity:")
    for ticker, count in top_assets:
        print(f"  {ticker}: {count} pairs")

    try:
        routes = await client.maker.get_market_routes(
            RoutesRequest(from_asset="BTC", to_asset="USDT", max_hops=3)
        )
        print(f"Route discovery returned {len(routes.routes)} route(s)")
        for route in routes.routes[:3]:
            hop_desc = " -> ".join(
                f"{step.from_asset}:{step.from_layer}->{step.to_asset}:{step.to_layer}"
                for step in route.steps
            )
            print(f"  hops={route.total_hops}: {hop_desc}")
    except Exception as exc:
        print(f"Route discovery failed: {exc}")


if __name__ == "__main__":
    asyncio.run(main())
