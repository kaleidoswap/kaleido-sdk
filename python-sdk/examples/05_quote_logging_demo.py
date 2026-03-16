#!/usr/bin/env python3
"""
Example 05: Quote Logging Demo

Demonstrates route discovery plus quote streaming with verbose SDK logging.
"""

import asyncio
import logging
import os

from kaleido_sdk import KaleidoClient, Layer

API_URL = os.getenv("KALEIDO_API_URL", "https://api.staging.kaleidoswap.com")
WS_URL = os.getenv("KALEIDO_WS_URL", "wss://api.staging.kaleidoswap.com/api/v1/market/ws")

# ---------------------------------------------------------------------------
# Logging setup (application's responsibility — the SDK never does this)
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)-8s] %(name)s — %(message)s",
    datefmt="%H:%M:%S",
)

# Keep useful SDK logs while cutting raw HTTP noise a bit.
logging.getLogger("kaleido_sdk.http").setLevel(logging.INFO)


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

    print("\nDiscovering routes for BTC/USDT...")
    routes = await client.maker.get_available_routes("BTC", "USDT")
    if not routes:
        print("No routes found for BTC/USDT")
        return

    for index, route in enumerate(routes, start=1):
        print(f"  {index}. {route.from_layer} -> {route.to_layer}")

    quotes_received = 0
    finished = asyncio.Event()

    def on_quote(quote: dict) -> None:
        nonlocal quotes_received
        quotes_received += 1

        from_asset = quote.get("from_asset") or {}
        to_asset = quote.get("to_asset") or {}

        print("\n" + "=" * 50)
        print(f"Quote #{quotes_received}")
        print("=" * 50)
        print(f"RFQ ID: {quote.get('rfq_id')}")
        print(f"From: {from_asset.get('amount')} {from_asset.get('ticker')} ({from_asset.get('layer')})")
        print(f"To: {to_asset.get('amount')} {to_asset.get('ticker')} ({to_asset.get('layer')})")
        print(f"Price: {quote.get('price')}")

        fee = quote.get("fee") or {}
        print(f"Fee: {fee.get('final_fee')} {fee.get('fee_asset')}")
        print(f"Valid for: {quote.get('expires_at', 0) - quote.get('timestamp', 0)}s")

        if quotes_received >= 5:
            finished.set()

    print("\nStreaming quotes using the first discovered route...")
    stop = await client.maker.stream_quotes_by_ticker(
        from_ticker="BTC",
        to_ticker="USDT",
        amount=100_000,
        on_update=on_quote,
        preferred_from_layer=Layer(routes[0].from_layer),
        preferred_to_layer=Layer(routes[0].to_layer),
        poll_interval=2.0,
    )

    try:
        await asyncio.wait_for(finished.wait(), timeout=15.0)
    finally:
        stop()
        ws.disconnect()
        # disconnect() schedules the websocket close on the running loop
        await asyncio.sleep(0.1)
        await client.close()

    print(f"\nReceived {quotes_received} quotes. Done.")


if __name__ == "__main__":
    asyncio.run(main())
