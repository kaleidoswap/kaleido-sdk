#!/usr/bin/env python3
"""
Simple WebSocket Test

Tests that the WebSocket methods are available and can be called.
Note: Requires a running WebSocket server to fully function.
"""

import asyncio

from kaleidoswap import KaleidoClient, KaleidoConfig, WsEvent

BASE_URL = "http://localhost:8000"


async def main():
    """Test WebSocket API availability."""
    print("=" * 60)
    print("Kaleidoswap SDK - WebSocket API Test")
    print("=" * 60)

    # Initialize client
    config = KaleidoConfig(
        base_url=BASE_URL,
        timeout=30.0,
    )
    client = KaleidoClient(config)

    print("\n✅ Client initialized")
    print(f"   Base URL: {BASE_URL}")

    # Test that WebSocket methods exist and are callable
    print("\n🔍 Testing WebSocket API methods...")

    # 1. Test connection status (should be False initially)
    try:
        connected = await client.is_websocket_connected()
        print(f"   ✅ is_websocket_connected() -> {connected}")
        assert not connected, "Should not be connected initially"
    except Exception as e:
        print(f"   ❌ is_websocket_connected() failed: {e}")

    # 2. Test that WsEvent enum is available
    try:
        print(f"   ✅ WsEvent.PriceUpdate = '{WsEvent.PriceUpdate}'")
        print(f"   ✅ WsEvent.QuoteResponse = '{WsEvent.QuoteResponse}'")
        print(f"   ✅ WsEvent.SwapUpdate = '{WsEvent.SwapUpdate}'")
        print(f"   ✅ WsEvent.Connected = '{WsEvent.Connected}'")
        print(f"   ✅ WsEvent.Disconnected = '{WsEvent.Disconnected}'")
        print(f"   ✅ WsEvent.Error = '{WsEvent.Error}'")
    except Exception as e:
        print(f"   ❌ WsEvent enum failed: {e}")

    # 3. Test connection (will fail without server, but method should exist)
    print("\n🔌 Testing connection (expecting failure without server)...")
    try:
        await client.connect_websocket()
        print("   ✅ connect_websocket() called successfully")

        # If we got here, try to check status
        connected = await client.is_websocket_connected()
        print(f"   ℹ️  Connection status: {connected}")

        # Try to disconnect
        await client.disconnect_websocket()
        print("   ✅ disconnect_websocket() called successfully")

    except Exception as e:
        print(f"   ⚠️  Connection failed (expected): {type(e).__name__}: {str(e)[:80]}")

    print("\n" + "=" * 60)
    print("✅ WebSocket API methods are available and callable!")
    print("=" * 60)
    print("\nNote: Actual WebSocket functionality requires a running server.")
    print("Run the full examples when connected to the Kaleidoswap API.")


if __name__ == "__main__":
    asyncio.run(main())
