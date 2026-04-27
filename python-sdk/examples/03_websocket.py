#!/usr/bin/env python3
"""
Example 03: WebSocket Streaming

Example showing how to stream real-time quotes via WebSocket.
The SDK automatically requests quotes at a configurable interval.
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
# DEBUG shows every WS message, HTTP request, ping, reconnect, etc.
# Switch to logging.INFO to see only meaningful lifecycle events.
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)-8s] %(name)s — %(message)s",
    datefmt="%H:%M:%S",
)


async def main() -> None:
    """Main entry point."""
    client = await KaleidoClient.create(
        base_url=API_URL,
        log_level=logging.DEBUG,
    )

    # Enable WebSocket
    ws = client.maker.enable_websocket(WS_URL)

    quotes_received = 0
    max_quotes = 5

    def on_quote(quote: dict) -> None:
        nonlocal quotes_received
        quotes_received += 1

        from_asset = quote.get("from_asset", {})
        to_asset = quote.get("to_asset", {})

        print(f"\nQuote #{quotes_received}:")
        print(
            f"  From: {from_asset.get('amount')} {from_asset.get('ticker')} ({from_asset.get('layer')})"
        )
        print(f"  To: {to_asset.get('amount')} {to_asset.get('ticker')} ({to_asset.get('layer')})")
        print(f"  Price: {quote.get('price')}")
        print(f"  RFQ ID: {quote.get('rfq_id')}")

    ws.on("connected", lambda: print("Connected to WebSocket!"))
    ws.on("disconnected", lambda: print("Disconnected from WebSocket"))
    ws.on("error", lambda e: print(f"WebSocket error: {e}"))

    try:
        print("Finding available routes...")
        routes = await client.maker.get_available_routes("BTC", "USDT")

        if not routes:
            print("No routes found for BTC/USDT")
            return

        print(f"Found {len(routes)} routes:")
        for route in routes:
            print(f"  - {route.from_layer} -> {route.to_layer}")

        print("\nStreaming quotes for BTC/USDT (automatically requests every 2 seconds)...")

        # Start streaming - quotes are automatically requested every 2 seconds
        stop = await client.maker.stream_quotes(
            from_asset="BTC",
            to_asset="USDT",
            from_amount=100000,
            from_layer=Layer(routes[0].from_layer),
            to_layer=Layer(routes[0].to_layer),
            on_update=on_quote,
            poll_interval=2.0,  # Request new quotes every 2 seconds
        )

        # Wait for quotes to arrive via callback
        while quotes_received < max_quotes:
            await asyncio.sleep(0.5)

        # Stop streaming and disconnect
        stop()
        ws.disconnect()
        print(f"\nReceived {quotes_received} quotes. Done!")

    except Exception as e:
        print(f"\nError: {e}")
        print("(WebSocket streaming requires a working WebSocket endpoint)")


if __name__ == "__main__":
    asyncio.run(main())
