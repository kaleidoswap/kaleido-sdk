#!/usr/bin/env python3
"""
Example 06: Multi-route Streaming

Simple example that streams a couple of BTC/USDT routes one at a time.
"""

import asyncio
import logging
import os

from kaleido_sdk import KaleidoClient, Layer

API_URL = os.getenv("KALEIDO_API_URL", "https://api.staging.kaleidoswap.com")
WS_URL = os.getenv("KALEIDO_WS_URL", "wss://api.staging.kaleidoswap.com/api/v1/market/ws")

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)-8s] %(name)s — %(message)s",
    datefmt="%H:%M:%S",
)


async def stream_once(client: KaleidoClient, from_layer: Layer, to_layer: Layer) -> None:
    """Stream two quotes for one route."""
    route_name = f"{from_layer.value} -> {to_layer.value}"
    received = 0
    done = asyncio.Event()

    def on_quote(quote: dict) -> None:
        nonlocal received
        received += 1

        from_asset = quote.get("from_asset") or {}
        to_asset = quote.get("to_asset") or {}

        print(f"\n{route_name} | quote #{received}")
        print(f"  RFQ ID: {quote.get('rfq_id')}")
        print(f"  From: {from_asset.get('amount')} {from_asset.get('ticker')}")
        print(f"  To: {to_asset.get('amount')} {to_asset.get('ticker')}")
        print(f"  Price: {quote.get('price')}")

        if received >= 2:
            done.set()

    stop = await client.maker.stream_quotes(
        from_asset="BTC",
        to_asset="USDT",
        from_amount=100_000,
        from_layer=from_layer,
        to_layer=to_layer,
        on_update=on_quote,
        poll_interval=2.0,
    )

    try:
        await asyncio.wait_for(done.wait(), timeout=10.0)
    except TimeoutError:
        print(f"\n{route_name} | no quotes returned")
    finally:
        stop()


async def main() -> None:
    """Main entry point."""
    client = KaleidoClient.create(
        base_url=API_URL,
        log_level=logging.DEBUG,
    )
    ws = client.maker.enable_websocket(WS_URL)

    print(f"Maker API: {API_URL}")
    print(f"WebSocket: {WS_URL}")
    print("-" * 40)

    routes = await client.maker.get_available_routes("BTC", "USDT")
    if not routes:
        print("No routes found for BTC/USDT")
        await client.close()
        return

    print("\nAvailable routes:")
    for route in routes:
        print(f"  - {route.from_layer} -> {route.to_layer}")

    print("\nStreaming the first two routes...")

    try:
        for route in routes[:2]:
            await stream_once(
                client,
                from_layer=Layer(route.from_layer),
                to_layer=Layer(route.to_layer),
            )
    finally:
        ws.disconnect()
        await asyncio.sleep(0.1)
        await client.close()


if __name__ == "__main__":
    asyncio.run(main())
