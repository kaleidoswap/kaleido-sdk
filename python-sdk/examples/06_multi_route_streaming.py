#!/usr/bin/env python3
"""
Example 06: Multi-route Streaming

Streams quotes across multiple available routes.
"""

import asyncio
import logging

from kaleidoswap_sdk import KaleidoClient, Layer

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)-8s] %(name)s - %(message)s",
    datefmt="%H:%M:%S",
)


async def stream_route(
    client: KaleidoClient, from_layer: Layer, to_layer: Layer
) -> None:
    received = 0
    done = asyncio.Event()

    def on_update(quote: dict) -> None:
        nonlocal received
        received += 1
        print(
            f"[{from_layer.value}->{to_layer.value}] quote #{received}: "
            f"price={quote.get('price')} rfq_id={quote.get('rfq_id')}"
        )
        if received >= 2:
            done.set()

    stop = await client.maker.stream_quotes(
        from_asset="BTC",
        to_asset="USDT",
        from_amount=100000,
        from_layer=from_layer,
        to_layer=to_layer,
        on_update=on_update,
        poll_interval=2.0,
    )

    try:
        await asyncio.wait_for(done.wait(), timeout=15)
    finally:
        stop()


async def main() -> None:
    client = KaleidoClient.create(base_url="https://api.staging.kaleidoswap.com")
    ws = client.maker.enable_websocket(
        "wss://api.staging.kaleidoswap.com/api/v1/market/ws"
    )

    routes = await client.maker.get_available_routes("BTC", "USDT")
    if not routes:
        print("No routes available for BTC/USDT")
        return

    print(f"Found {len(routes)} route(s), streaming first {min(2, len(routes))}...")

    try:
        for route in routes[:2]:
            from_layer = Layer(route.from_layer)
            to_layer = Layer(route.to_layer)
            await stream_route(client, from_layer, to_layer)
    finally:
        ws.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
