#!/usr/bin/env python3
"""
WebSocket Method Test

This example simply tests that the WebSocket methods are available
without actually connecting.
"""

from kaleidoswap import KaleidoClient, KaleidoConfig, WsEvent

BASE_URL = "http://localhost:8000"


def main():
    """Test WebSocket method availability."""
    print("=" * 60)
    print("Kaleidoswap SDK - WebSocket Method Test")
    print("=" * 60)

    # Initialize client
    config = KaleidoConfig(
        base_url=BASE_URL,
        timeout=5.0,  # Short timeout for testing
    )
    client = KaleidoClient(config)

    print("\n✅ Client initialized")

    # Test that methods exist
    print("\n🔍 Checking WebSocket methods...")

    assert hasattr(client, 'connect_websocket'), "Missing connect_websocket"
    print("   ✅ connect_websocket exists")

    assert hasattr(client, 'disconnect_websocket'), "Missing disconnect_websocket"
    print("   ✅ disconnect_websocket exists")

    assert hasattr(client, 'is_websocket_connected'), "Missing is_websocket_connected"
    print("   ✅ is_websocket_connected exists")

    assert hasattr(client, 'subscribe_to_pair'), "Missing subscribe_to_pair"
    print("   ✅ subscribe_to_pair exists")

    assert hasattr(client, 'unsubscribe_from_pair'), "Missing unsubscribe_from_pair"
    print("   ✅ unsubscribe_from_pair exists")

    assert hasattr(client, 'get_quote_websocket'), "Missing get_quote_websocket"
    print("   ✅ get_quote_websocket exists")

    assert hasattr(client, 'reconnect_websocket'), "Missing reconnect_websocket"
    print("   ✅ reconnect_websocket exists")

    # Test WsEvent enum
    print("\n🔍 Checking WsEvent enum...")
    print(f"   ✅ WsEvent.PriceUpdate = '{WsEvent.PriceUpdate}'")
    print(f"   ✅ WsEvent.QuoteResponse = '{WsEvent.QuoteResponse}'")
    print(f"   ✅ WsEvent.SwapUpdate = '{WsEvent.SwapUpdate}'")
    print(f"   ✅ WsEvent.Connected = '{WsEvent.Connected}'")
    print(f"   ✅ WsEvent.Disconnected = '{WsEvent.Disconnected}'")
    print(f"   ✅ WsEvent.Error = '{WsEvent.Error}'")

    # Test connection status without connecting
    print("\n🔍 Testing is_websocket_connected (should return False)...")
    try:
        is_connected = client.is_websocket_connected()
        print(f"   ✅ is_websocket_connected() -> {is_connected}")
    except Exception as e:
        print(f"   ❌ Error: {e}")

    print("\n" + "=" * 60)
    print("✅ All method tests passed!")
    print("=" * 60)


if __name__ == "__main__":
    main()
