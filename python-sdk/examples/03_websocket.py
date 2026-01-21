#!/usr/bin/env python3
"""
Example 03: WebSocket Streaming

Example showing how to stream real-time quotes via WebSocket.
"""

import asyncio
from kaleidoswap_sdk import (
    KaleidoClient,
    Layer,
    to_display_units,
)


async def main() -> None:
    """Main entry point."""
    # Create client
    client = KaleidoClient.create(
        base_url="https://api.kaleidoswap.com"
    )

    async with client:
        # Enable WebSocket
        ws_url = "wss://api.kaleidoswap.com/ws"
        ws = client.maker.enable_websocket(ws_url)

        # Track quotes received
        quotes_received = 0
        max_quotes = 5

        def on_quote(quote: dict) -> None:
            """Handle incoming quote."""
            nonlocal quotes_received
            quotes_received += 1

            print(f"\nQuote #{quotes_received}:")
            print(f"  From: {quote.get('from_amount')} {quote.get('from_asset')}")
            print(f"  To: {quote.get('to_amount')} {quote.get('to_asset')}")
            print(f"  Price: {quote.get('price')}")
            print(f"  RFQ ID: {quote.get('rfq_id')}")

        def on_connected() -> None:
            """Handle connection established."""
            print("Connected to WebSocket!")

        def on_disconnected() -> None:
            """Handle disconnection."""
            print("Disconnected from WebSocket")

        def on_error(error: Exception) -> None:
            """Handle errors."""
            print(f"WebSocket error: {error}")

        # Set up event handlers
        ws.on("connected", on_connected)
        ws.on("disconnected", on_disconnected)
        ws.on("error", on_error)

        try:
            # Get available routes first
            print("Finding available routes...")
            routes = await client.maker.get_available_routes("BTC", "USDT")

            if not routes:
                print("No routes found for BTC/USDT")
                return

            print(f"Found {len(routes)} routes:")
            for route in routes:
                print(f"  - {route['from_layer']} -> {route['to_layer']}")

            # Stream quotes using the first route
            print(f"\nStreaming quotes for BTC/USDT...")
            print(f"(Will receive {max_quotes} quotes then stop)")

            unsubscribe = await client.maker.stream_quotes(
                from_asset="BTC",
                to_asset="USDT",
                from_amount=100000,  # 0.001 BTC in satoshis
                from_layer=Layer(routes[0]["from_layer"]),
                to_layer=Layer(routes[0]["to_layer"]),
                on_update=on_quote,
            )

            # Wait for quotes
            while quotes_received < max_quotes:
                await asyncio.sleep(1)

            # Cleanup
            unsubscribe()
            ws.disconnect()

            print(f"\nReceived {quotes_received} quotes. Done!")

        except Exception as e:
            print(f"\nError: {e}")
            print("(WebSocket streaming requires a working WebSocket endpoint)")


if __name__ == "__main__":
    asyncio.run(main())
