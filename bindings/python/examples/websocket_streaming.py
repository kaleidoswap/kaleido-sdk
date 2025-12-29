#!/usr/bin/env python3
"""
WebSocket Streaming Example

This example demonstrates:
1. Connecting to WebSocket
2. Subscribing to price updates
3. Handling real-time events
4. Event handlers and callbacks
"""

import asyncio
from datetime import datetime
from typing import Dict

from kaleidoswap import KaleidoClient, KaleidoConfig, WsEvent

BASE_URL = "https://api.regtest.kaleidoswap.com"
BASE_URL = "http://localhost:8000"


class PriceTracker:
    """Track price updates."""

    def __init__(self):
        self.update_count = 0
        self.latest_prices: Dict[str, float] = {}

    async def handle_price_update(self, data: dict):
        """Handle price update events."""
        self.update_count += 1
        pair = data.get("pair", "Unknown")
        price = data.get("price", 0.0)

        self.latest_prices[pair] = price

        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] 📊 Price Update #{self.update_count}")
        print(f"  Pair: {pair}")
        print(f"  Price: ${price:.2f}")

        if "volume" in data:
            print(f"  Volume: {data['volume']}")
        print()

    async def handle_quote_response(self, data: dict):
        """Handle quote responses."""
        rfq_id = data.get("rfq_id", "Unknown")
        price = data.get("price", 0.0)

        print("💱 Quote Response")
        print(f"  RFQ ID: {rfq_id}")
        print(f"  Price: ${price:.2f}")
        print()

    async def handle_error(self, data: dict):
        """Handle errors."""
        message = data.get("message", "Unknown error")
        code = data.get("code", "")

        print("❌ WebSocket Error")
        print(f"  Message: {message}")
        if code:
            print(f"  Code: {code}")
        print()

    async def handle_disconnected(self, data: dict):
        """Handle disconnection."""
        reason = data.get("reason", "Unknown")
        print("\n⚠️  WebSocket Disconnected")
        print(f"  Reason: {reason}")

    def print_summary(self):
        """Print summary statistics."""
        print("\n" + "=" * 60)
        print("📈 Session Summary")
        print("=" * 60)
        print(f"Total updates received: {self.update_count}")
        print("\nLatest prices:")
        for pair, price in self.latest_prices.items():
            print(f"  {pair}: ${price:.2f}")
        print("=" * 60)


async def main():
    """Run WebSocket streaming example."""
    print("=" * 60)
    print("Kaleidoswap SDK - WebSocket Streaming Example")
    print("=" * 60)

    # Create price tracker
    tracker = PriceTracker()

    # Initialize client
    config = KaleidoConfig(
        base_url=BASE_URL,
        timeout=30.0,
    )
    client = KaleidoClient(config)

    try:
        # Connect to WebSocket
        print("\n📡 Connecting to WebSocket...")
        await client.connect_websocket()
        print("✅ WebSocket connected!")

        # Register event handlers
        print("\n📝 Registering event handlers...")
        await client.on_websocket_event(
            WsEvent.PriceUpdate, tracker.handle_price_update
        )
        await client.on_websocket_event(
            WsEvent.QuoteResponse, tracker.handle_quote_response
        )
        await client.on_websocket_event(WsEvent.Error, tracker.handle_error)
        await client.on_websocket_event(
            WsEvent.Disconnected, tracker.handle_disconnected
        )
        print("✅ Event handlers registered!")

        # Subscribe to pairs
        print("\n📥 Subscribing to trading pairs...")
        await client.subscribe_to_pair("BTC/USDT")
        await client.subscribe_to_pair("ETH/USDT")
        print("✅ Subscribed to BTC/USDT and ETH/USDT")

        # Stream for 30 seconds
        print("\n👂 Listening for updates... (30 seconds)")
        print("   Press Ctrl+C to stop early\n")

        try:
            await asyncio.sleep(30)
        except KeyboardInterrupt:
            print("\n\n⏸️  Interrupted by user")

        # Unsubscribe
        print("\n📤 Unsubscribing from pairs...")
        await client.unsubscribe_from_pair("BTC/USDT")
        await client.unsubscribe_from_pair("ETH/USDT")
        print("✅ Unsubscribed")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nNote: WebSocket connection requires authentication.")
        print("This example demonstrates the API usage pattern.")

    finally:
        # Disconnect only if connected
        if await client.is_websocket_connected():
            print("\n🔌 Disconnecting WebSocket...")
            try:
                await client.disconnect_websocket()
                print("✅ Disconnected")
            except Exception as e:
                print(f"⚠️  Disconnect warning: {e}")

        # Print summary
        tracker.print_summary()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nExiting...")
